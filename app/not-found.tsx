export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
        <p className="text-xl mb-4">Awe Snap! The page you're looking for doesn't exist.</p>
        <p className="mb-4">Let's get you back to my resume.</p>
        <p className="mb-6">Just click the button below to return.</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Return to Resume
        </a>
      </div>
    </div>
  )
}
