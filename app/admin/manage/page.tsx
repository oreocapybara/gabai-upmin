export default function ManagePage() {
  return (
    <div className="flex min-h-screen flex-col gap-8 p-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Listings</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Create, edit, and delete listings from the admin dashboard.
        </p>
      </div>
      <div className="grid gap-4 rounded-md border p-6 bg-card">
        <p className="text-sm text-muted-foreground">
          Use the admin tools here to manage your location data.
        </p>
      </div>
    </div>
  );
}
