import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="flex-grow container mx-auto px-4 py-16">
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 text-blue-600">About WebVulnLearn</h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            WebVulnLearn is an interactive educational platform designed for individuals passionate about cybersecurity. Our goal is to teach you how to identify, understand, and prevent common web vulnerabilities through hands-on practice and real-world simulations.
          </p>
        </section>

        {/* Mission Section */}
        <section className="bg-white shadow rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-semibold text-center text-blue-600 mb-4">Our Mission</h2>
          <p className="text-gray-700 max-w-3xl mx-auto text-center">
            Our mission is to make cybersecurity education accessible, practical, and engaging for everyone. Whether you're a developer, a security enthusiast, or a student, WebVulnLearn helps you master essential cybersecurity skills in a safe environment.
          </p>
        </section>

        {/* What We Offer Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded shadow">
            <img
              src="https://tse2.mm.bing.net/th?id=OIP.AYg1P0syFnDXEcz_YRSw2AHaE8&pid=Api"
              alt="Interactive Labs"
              className="w-full h-40 object-cover rounded mb-4"
            />
            <h3 className="font-semibold text-xl mb-2 text-blue-600">Interactive Labs</h3>
            <p className="text-gray-700">
              Practice cybersecurity skills in a controlled and safe environment. Our interactive labs allow you to simulate vulnerabilities and explore real-world security issues.
            </p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <img
              src="https://tse2.mm.bing.net/th?id=OIP.9q9kdQ0HVPh-XCQfA1GBcAHaEK&pid=Api"
              alt="Comprehensive Tutorials"
              className="w-full h-40 object-cover rounded mb-4"
            />
            <h3 className="font-semibold text-xl mb-2 text-blue-600">Comprehensive Tutorials</h3>
            <p className="text-gray-700">
              Learn about various web vulnerabilities, such as SQL Injection, Cross-Site Scripting (XSS), and CSRF attacks, with in-depth tutorials and practical insights.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-white shadow rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-center text-blue-600 mb-4">Our Core Values</h2>
          <ul className="list-disc list-inside text-gray-700 max-w-3xl mx-auto">
            <li className="mb-2">
              <strong>Accessibility:</strong> Making cybersecurity education available to everyone.
            </li>
            <li className="mb-2">
              <strong>Practical Learning:</strong> Providing hands-on experiences through interactive labs.
            </li>
            <li className="mb-2">
              <strong>Continuous Improvement:</strong> Adapting and enhancing our offerings to meet evolving security needs.
            </li>
            <li className="mb-2">
              <strong>Community Focus:</strong> Building a supportive network of learners and experts.
            </li>
          </ul>
        </section>
      </main>

      {/* CTA Section */}
      <footer className="bg-blue-600 text-white text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Ready to Start Learning?</h2>
        <p className="mb-8">Sign up today and begin your journey in web vulnerability and cybersecurity education!</p>
        <Link to="/register" className="px-4 py-2 bg-white text-blue-600 rounded">
          Get Started
        </Link>
      </footer>
    </div>
  );
}
