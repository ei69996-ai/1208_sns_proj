/**
 * @file verify-storage.ts
 * @description Storage 버킷 검증 스크립트
 *
 * Supabase Storage에 필요한 버킷이 생성되었는지 확인합니다.
 * 
 * 실행 방법:
 * npx tsx scripts/verify-storage.ts
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

async function verifyStorage() {
  console.log("🔍 Storage 버킷 검증을 시작합니다...\n");

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error("❌ Storage 버킷 목록 조회 실패:", error.message);
      console.log("\n📖 가이드: docs/setup-storage.md");
      process.exit(1);
    }

    const uploadsBucket = buckets?.find((bucket) => bucket.name === "uploads");

    if (!uploadsBucket) {
      console.log("❌ 'uploads' 버킷이 생성되지 않았습니다.");
      console.log("\n📖 가이드: docs/setup-storage.md");
      console.log("   Supabase Dashboard → Storage → New bucket → 이름: 'uploads', Public bucket: 체크");
      process.exit(1);
    }

    console.log("✅ 'uploads' 버킷이 생성되었습니다.");
    console.log(`   - 이름: ${uploadsBucket.name}`);
    console.log(`   - 공개 여부: ${uploadsBucket.public ? "공개" : "비공개"}`);
    console.log(`   - 생성일: ${uploadsBucket.created_at}`);

    if (!uploadsBucket.public) {
      console.log("\n⚠️ 경고: 'uploads' 버킷이 공개로 설정되지 않았습니다.");
      console.log("   공개 읽기를 활성화하려면 Supabase Dashboard에서 설정을 변경하세요.");
    }

    console.log("\n🎉 Storage 버킷이 정상적으로 설정되었습니다!");
    process.exit(0);
  } catch (error) {
    console.error("❌ 검증 중 오류 발생:", error);
    console.log("\n📖 가이드: docs/setup-storage.md");
    process.exit(1);
  }
}

verifyStorage();

