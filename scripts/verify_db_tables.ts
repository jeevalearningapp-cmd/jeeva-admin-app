import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qsvjzvgsnbslgypykuznd.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzdmp2Z3NuYnNsZ3lweWt1em5kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTkwMDUwOCwiZXhwIjoyMDc1NDc2NTA4fQ.rcq2isspQ7gtpYRpIcYrtwtCb3VJ_JgkjibWlMJfwsk";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyTables() {
  console.log("Verifying tables...");

  const tables = [
    "questions",
    "practice_questions",
    "mock_exam_questions",
    "learning_questions",
  ];

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });

    if (error) {
      console.log(`❌ Table '${table}' check failed: ${error.message}`);
    } else {
      console.log(`✅ Table '${table}' exists. Count: ${count}`);
    }
  }

  // Check columns in 'questions' table to see if it's the shared one
  const { data: questionsData, error: questionsError } = await supabase
    .from("questions")
    .select("module_type")
    .limit(1);

  if (!questionsError) {
    console.log(
      "ℹ️  Table questions has columns:",
      questionsData && questionsData.length > 0
        ? Object.keys(questionsData[0])
        : "No data to infer columns",
    );
  }
}

verifyTables();
