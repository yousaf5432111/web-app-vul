import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiShield, FiBook, FiUsers, FiTrendingUp } from "react-icons/fi";
import AIAssistant from "./AIAssistant";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-800">
        <div className="container mx-auto px-6 py-24 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
            >
              About <span className="text-blue-200">WebVulnLearn</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto"
            >
              The premier interactive platform for mastering web security through hands-on vulnerability training.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600">
              We're revolutionizing cybersecurity education by making it accessible, practical, and engaging for everyone. 
              Whether you're a developer, security professional, or student, WebVulnLearn provides the tools to master 
              essential security skills in a safe, controlled environment.
            </p>
          </motion.div>

          {/* What We Offer Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <FiShield className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Interactive Labs</h3>
              <p className="text-gray-600">
                Practice real-world vulnerabilities in our safe, sandboxed environment with guided exercises that simulate 
                actual security threats and attack scenarios.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <FiBook className="text-indigo-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Comprehensive Learning</h3>
              <p className="text-gray-600">
                Structured learning paths covering OWASP Top 10 vulnerabilities with detailed explanations, 
                code samples, and mitigation techniques.
              </p>
            </motion.div>
          </div>

          {/* Values Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Our Core Values</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gray-50 p-6 rounded-lg shadow-sm"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <FiUsers className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Accessibility</h3>
                </div>
                <p className="text-gray-600">
                  Making cybersecurity education available to everyone, regardless of their background or experience level.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gray-50 p-6 rounded-lg shadow-sm"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <FiShield className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Practical Learning</h3>
                </div>
                <p className="text-gray-600">
                  Emphasizing hands-on experiences through interactive labs that simulate real-world security challenges.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gray-50 p-6 rounded-lg shadow-sm"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <FiTrendingUp className="text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Continuous Improvement</h3>
                </div>
                <p className="text-gray-600">
                  Constantly updating our content to reflect the latest security threats and best practices.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gray-50 p-6 rounded-lg shadow-sm"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                    <FiUsers className="text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Community Focus</h3>
                </div>
                <p className="text-gray-600">
                  Building a supportive network where learners and experts can collaborate and share knowledge.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Section (Optional) */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Approach</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We combine cutting-edge technology with proven educational methodologies to create the most effective 
              cybersecurity learning platform available today.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-800 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Enhance Your Security Skills?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join our community of security professionals and developers today.
            </p>
            <Link 
              to="/register" 
              className="inline-block px-8 py-4 bg-white hover:bg-gray-100 text-blue-600 font-medium rounded-lg shadow-lg transition-all duration-300"
            >
              Get Started Now
            </Link>
          </motion.div>
        </div>
      </section>
    <AIAssistant />
    </div>
  );
}
