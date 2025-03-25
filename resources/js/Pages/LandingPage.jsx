import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Header Section */}
        <section className="py-20 text-center bg-blue-600 text-white">
          <h1 className="text-4xl font-bold mb-4">Learn and Test Web Vulnerabilities Safely</h1>
          <p className="text-xl mb-8">Master cybersecurity skills with our interactive platform</p>
          <div className="space-x-4">
            <Link to="/register" className="px-4 py-2 bg-white text-blue-600 rounded">Get Started</Link>
            <Link to="/about" className="px-4 py-2 border border-white text-white rounded">Learn More</Link>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded shadow">
                <img src="https://tse4.mm.bing.net/th?id=OIP.1rUTQXMGlFYbOAs2U9KZ_QHaEK&pid=Api" alt="Interactive Labs" className="mb-4 rounded" />
                <h3 className="font-semibold mb-2">Interactive Labs</h3>
                <p>Practice in a safe, controlled environment with our hands-on labs.</p>
              </div>
              <div className="bg-white p-6 rounded shadow">
                <img src="https://tse3.mm.bing.net/th?id=OIP.ZDsz2u8RHMISh8p5999oBwHaD4&pid=Api" alt="Learning Modules" className="mb-4 rounded" />
                <h3 className="font-semibold mb-2">Learning Modules</h3>
                <p>Comprehensive tutorials covering various web vulnerabilities.</p>
              </div>
              <div className="bg-white p-6 rounded shadow">
                <img src="https://tse2.mm.bing.net/th?id=OIP.oIV6aW6_W3ovnP4z1CJKWwHaEF&pid=Api" alt="Secure Coding Practices" className="mb-4 rounded" />
                <h3 className="font-semibold mb-2">Secure Coding Practices</h3>
                <p>Learn how to write secure code and prevent vulnerabilities.</p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">About WebVulnLearn</h2>
            <p className="text-lg text-center max-w-2xl mx-auto">
              WebVulnLearn is a platform dedicated to teaching web security. Our comprehensive tutorials and interactive labs help users understand web vulnerabilities and how to prevent them through secure coding practices.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
