export const metadata = {
    title: "Profile",
};

export default function ProfilePage() {
    return (
        <div className="container px-0">
            <ProfileHeader />
            <ProfileContent />
        </div>
    );
}
