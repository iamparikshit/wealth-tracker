import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ExportRequest {
  expenses: Array<{
    date: string;
    category: string;
    description: string;
    amount: number;
  }>;
  format: 'csv' | 'sheets';
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: ExportRequest = await req.json();
    const { expenses, format } = body;

    if (!expenses || !Array.isArray(expenses)) {
      return new Response(JSON.stringify({ error: "Invalid expenses data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate CSV content
    const headers = ["Date", "Category", "Description", "Amount"];
    const rows = expenses.map((e) => [
      e.date,
      e.category,
      `"${(e.description || "").replace(/"/g, '""')}"`,
      e.amount.toFixed(2)
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    if (format === 'csv') {
      return new Response(csv, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=expenses.csv"
        }
      });
    }

    // For Google Sheets, return CSV with instructions
    return new Response(JSON.stringify({
      csv,
      instructions: "Copy this CSV data and paste into Google Sheets, or use File > Import"
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
