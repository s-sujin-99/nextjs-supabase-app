import { ProfileForm } from "@/components/gather/profile-form";
import { MOCK_USERS } from "@/lib/mock/gather";

// Task 008: 실제 로그인 사용자 정보(F011)로 교체 예정
export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">프로필</h1>
      <ProfileForm user={MOCK_USERS[0]} />
    </div>
  );
}
