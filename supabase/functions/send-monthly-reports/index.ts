
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MonthlyReportData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  reportMonth: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    // Get the previous month
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const reportMonth = previousMonth.toISOString().slice(0, 7); // YYYY-MM format

    console.log(`Processing monthly reports for ${reportMonth}`);

    // Get all users with monthly reports enabled
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        monthly_reports_enabled
      `)
      .eq('monthly_reports_enabled', true);

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    }

    console.log(`Found ${profiles?.length || 0} users with reports enabled`);

    for (const profile of profiles || []) {
      try {
        // Check if reports were already sent for this month
        const { data: existingLogs } = await supabase
          .from('monthly_reports_log')
          .select('report_type')
          .eq('user_id', profile.id)
          .eq('report_month', reportMonth);

        const alreadySentAnalysis = existingLogs?.some(log => log.report_type === 'analysis');
        const alreadySentArchive = existingLogs?.some(log => log.report_type === 'archive');

        // Get user's bets for the previous month
        const { data: bets, error: betsError } = await supabase
          .from('bets')
          .select('*')
          .eq('user_id', profile.id)
          .gte('date', `${reportMonth}-01`)
          .lt('date', `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}-01`);

        if (betsError) {
          console.error(`Failed to fetch bets for user ${profile.id}:`, betsError);
          continue;
        }

        if (!bets || bets.length === 0) {
          console.log(`No bets found for user ${profile.id} in ${reportMonth}`);
          continue;
        }

        // Get user email from auth.users
        const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);
        
        if (!authUser.user?.email) {
          console.error(`No email found for user ${profile.id}`);
          continue;
        }

        const reportData: MonthlyReportData = {
          userId: profile.id,
          email: authUser.user.email,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          reportMonth
        };

        // Send analysis report if not already sent
        if (!alreadySentAnalysis) {
          await sendAnalysisReport(resend, reportData, bets);
          
          // Log the analysis report send
          await supabase
            .from('monthly_reports_log')
            .insert({
              user_id: profile.id,
              report_month: reportMonth,
              report_type: 'analysis'
            });
        }

        // Send archive report if not already sent
        if (!alreadySentArchive) {
          await sendArchiveReport(resend, reportData, bets);
          
          // Log the archive report send
          await supabase
            .from('monthly_reports_log')
            .insert({
              user_id: profile.id,
              report_month: reportMonth,
              report_type: 'archive'
            });
        }

        console.log(`Reports sent successfully for user ${profile.id}`);
        
      } catch (error) {
        console.error(`Error processing user ${profile.id}:`, error);
        continue;
      }
    }

    return new Response(
      JSON.stringify({ 
        message: "Monthly reports processed successfully",
        reportMonth,
        processedUsers: profiles?.length || 0
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-monthly-reports function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function sendAnalysisReport(resend: any, reportData: MonthlyReportData, bets: any[]) {
  // Calculate analysis metrics
  const totalBets = bets.length;
  const wonBets = bets.filter(bet => bet.status === 'won').length;
  const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;
  const totalProfit = bets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
  const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
  const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;

  const monthName = new Date(reportData.reportMonth).toLocaleDateString('it-IT', { 
    month: 'long', 
    year: 'numeric' 
  });

  await resend.emails.send({
    from: "Betting Tracker <reports@resend.dev>",
    to: [reportData.email],
    subject: `📊 Analisi mensile - ${monthName}`,
    html: `
      <h1>Ciao ${reportData.firstName}!</h1>
      <p>Ecco la tua analisi delle scommesse per <strong>${monthName}</strong>:</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2>📈 Statistiche Principali</h2>
        <ul>
          <li><strong>Totale Scommesse:</strong> ${totalBets}</li>
          <li><strong>Percentuale Vincita:</strong> ${winRate.toFixed(1)}%</li>
          <li><strong>Profitto Totale:</strong> €${totalProfit.toFixed(2)}</li>
          <li><strong>ROI:</strong> ${roi.toFixed(2)}%</li>
          <li><strong>Stake Totale:</strong> €${totalStake.toFixed(2)}</li>
        </ul>
      </div>
      
      <p>Continua così e buona fortuna per il mese prossimo! 🍀</p>
      
      <hr>
      <p><small>Per disattivare questi report automatici, vai nelle impostazioni del tuo profilo.</small></p>
    `,
  });
}

async function sendArchiveReport(resend: any, reportData: MonthlyReportData, bets: any[]) {
  const monthName = new Date(reportData.reportMonth).toLocaleDateString('it-IT', { 
    month: 'long', 
    year: 'numeric' 
  });

  // Create CSV content for the archive
  const csvHeader = "Data,Evento,Selezione,Quote,Stake,Stato,Profitto,Sport,Bookmaker\n";
  const csvContent = bets.map(bet => {
    const date = new Date(bet.date).toLocaleDateString('it-IT');
    return `"${date}","${bet.event}","${bet.selection || ''}","${bet.odds}","${bet.stake}","${bet.status}","${bet.profit || 0}","${bet.sport || ''}","${bet.bookmaker || ''}"`;
  }).join('\n');
  
  const csvData = csvHeader + csvContent;
  const csvBase64 = btoa(unescape(encodeURIComponent(csvData)));

  await resend.emails.send({
    from: "Betting Tracker <reports@resend.dev>",
    to: [reportData.email],
    subject: `📋 Archivio scommesse - ${monthName}`,
    html: `
      <h1>Ciao ${reportData.firstName}!</h1>
      <p>In allegato trovi l'archivio completo delle tue scommesse per <strong>${monthName}</strong>.</p>
      
      <p>Il file contiene tutte le ${bets.length} scommesse del mese con tutti i dettagli.</p>
      
      <p>Buona fortuna per il mese prossimo! 🍀</p>
      
      <hr>
      <p><small>Per disattivare questi report automatici, vai nelle impostazioni del tuo profilo.</small></p>
    `,
    attachments: [
      {
        filename: `scommesse-${reportData.reportMonth}.csv`,
        content: csvBase64,
        content_type: 'text/csv',
      },
    ],
  });
}

serve(handler);
