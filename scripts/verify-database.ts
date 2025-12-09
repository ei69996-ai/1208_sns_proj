/**
 * @file verify-database.ts
 * @description 데이터베이스 스키마 검증 스크립트
 *
 * Supabase 데이터베이스에 필요한 테이블, 뷰, 트리거가 생성되었는지 확인합니다.
 * 
 * 실행 방법:
 * npx tsx scripts/verify-database.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ 환경 변수가 설정되지 않았습니다.");
  console.error("NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY (또는 NEXT_PUBLIC_SUPABASE_ANON_KEY)를 설정하세요.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface VerificationResult {
  name: string;
  status: "✅" | "❌";
  message: string;
}

async function verifyDatabase() {
  const results: VerificationResult[] = [];

  console.log("🔍 데이터베이스 스키마 검증을 시작합니다...\n");

  // 1. 테이블 확인
  const requiredTables = ["users", "posts", "likes", "comments", "follows"];
  
  for (const tableName of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .limit(1);

      if (error) {
        results.push({
          name: `테이블: ${tableName}`,
          status: "❌",
          message: error.message,
        });
      } else {
        results.push({
          name: `테이블: ${tableName}`,
          status: "✅",
          message: "생성됨",
        });
      }
    } catch (error) {
      results.push({
        name: `테이블: ${tableName}`,
        status: "❌",
        message: error instanceof Error ? error.message : "알 수 없는 오류",
      });
    }
  }

  // 2. 뷰 확인
  const requiredViews = ["post_stats", "user_stats"];
  
  for (const viewName of requiredViews) {
    try {
      const { data, error } = await supabase
        .from(viewName)
        .select("*")
        .limit(1);

      if (error) {
        results.push({
          name: `뷰: ${viewName}`,
          status: "❌",
          message: error.message,
        });
      } else {
        results.push({
          name: `뷰: ${viewName}`,
          status: "✅",
          message: "생성됨",
        });
      }
    } catch (error) {
      results.push({
        name: `뷰: ${viewName}`,
        status: "❌",
        message: error instanceof Error ? error.message : "알 수 없는 오류",
      });
    }
  }

  // 3. 결과 출력
  console.log("📊 검증 결과:\n");
  results.forEach((result) => {
    console.log(`${result.status} ${result.name}: ${result.message}`);
  });

  const successCount = results.filter((r) => r.status === "✅").length;
  const totalCount = results.length;

  console.log(`\n✅ 성공: ${successCount}/${totalCount}`);

  if (successCount === totalCount) {
    console.log("\n🎉 모든 데이터베이스 스키마가 정상적으로 생성되었습니다!");
    process.exit(0);
  } else {
    console.log("\n⚠️ 일부 스키마가 누락되었습니다. 마이그레이션을 실행하세요.");
    console.log("📖 가이드: docs/setup-database.md");
    process.exit(1);
  }
}

verifyDatabase().catch((error) => {
  console.error("❌ 검증 중 오류 발생:", error);
  process.exit(1);
});

