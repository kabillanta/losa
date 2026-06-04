export default function DashboardPage() {
  return (
    <div className="flex items-center justify-center h-full p-8 text-center">
      <div className="max-w-md">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
          👋
        </div>
        <h1 className="text-2xl font-bold text-onyx mb-2">Welcome to Registration</h1>
        <p className="text-taupe">
          Please select an event from the sidebar on the left to start adding your participating students.
        </p>
      </div>
    </div>
  );
}
