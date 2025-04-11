import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FiShield, 
  FiAlertTriangle, 
  FiCode, 
  FiLock, 
  FiDatabase,
  FiAlertOctagon,
  FiHome,
  FiInfo,
  FiMessageSquare
} from "react-icons/fi";

// Import your images (make sure to add these files to your project)
import websiteHomePage from './images/website-homepage.png';
import nmapScan from './images/nmap-scan.png';
import zapResults from './images/zap-results.png';
import sqlDiagram from './images/sql-diagram.png';
import xssPayload from './images/xss-payload.png';
import idorExample from './images/idor-example.png';
import sqlInjection from './images/sql-injection.png';
import sqlmapResults from './images/sqlmap-results.png';

export default function SecurityReportPage() {
  const vulnerabilities = [
    {
      title: "SQL Injection",
      description: "Login page vulnerable to SQLi allowing database access",
      severity: "Critical",
      icon: <FiDatabase className="text-red-500" />,
      findings: [
        "Plaintext password storage",
        "Admin credentials exposed",
        "Full database dump possible"
      ],
      remediation: "Implement prepared statements, input validation, and password hashing",
      figures: [
        { image: sqlInjection, caption: "Figure 14: SQL Injection attempt" },
        { image: sqlmapResults, caption: "Figure 15: SQLmap results showing database dump" },
        { image: sqlDiagram, caption: "Figure 9: SQL injection attack flow diagram" }
      ]
    },
    {
      title: "Cross-Site Scripting (XSS)",
      description: "Stored XSS in product input field",
      severity: "High",
      icon: <FiCode className="text-orange-500" />,
      findings: [
        "Script execution in product listings",
        "DOM manipulation possible",
        "Session hijacking risk"
      ],
      remediation: "Implement output encoding and Content Security Policy (CSP)",
      figures: [
        { image: xssPayload, caption: "Figure 12: XSS payload example" }
      ]
    },
    {
      title: "Insecure Direct Object Reference (IDOR)",
      description: "Shop item IDs exposed in URLs",
      severity: "High",
      icon: <FiLock className="text-orange-500" />,
      findings: [
        "Unauthorized data access",
        "Parameter manipulation vulnerability",
        "Privilege escalation possible"
      ],
      remediation: "Implement proper access controls and use indirect references",
      figures: [
        { image: idorExample, caption: "Figure 10: IDOR vulnerability example" }
      ]
    },
    {
      title: "Cookie Security Issues",
      description: "Insecure cookie handling",
      severity: "Medium",
      icon: <FiShield className="text-yellow-500" />,
      findings: [
        "Session fixation possible",
        "Missing HttpOnly and Secure flags",
        "Predictable session tokens"
      ],
      remediation: "Implement secure cookie attributes and regenerate session IDs"
    }
  ];

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
              Security <span className="text-blue-200">Audit Report</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto"
            >
              Comprehensive analysis of security vulnerabilities and recommended fixes
            </motion.p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          {/* Executive Summary */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto mb-16 p-6 bg-gray-50 rounded-xl shadow-sm"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Executive Summary</h2>
            
            <div className="mb-6">
              <img 
                src={websiteHomePage} 
                alt="Website Home Page" 
                className="rounded-lg shadow-md w-full max-w-2xl mx-auto"
              />
              <p className="text-sm text-gray-500 text-center mt-2">Figure 1: Website home page</p>
            </div>
            
            <p className="text-gray-600 mb-4">
              The Abbot-Kris e-commerce website was found to have multiple critical security vulnerabilities
              that could compromise user data and system integrity. The most severe issues include SQL injection,
              cross-site scripting, and insecure direct object references.
            </p>
            <p className="text-gray-600">
              The outdated server software (Apache 2.4.25) contains known vulnerabilities (CVE-2017-3169, CVE-2017-7659)
              and requires immediate patching. User credentials are stored in plaintext, significantly increasing
              the impact of any data breach.
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">4 Critical Issues</span>
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">3 High Risk Issues</span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">2 Medium Risk Issues</span>
            </div>
          </motion.div>

          {/* Website Functionality */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Website Technical Stack</h2>
            
            <div className="mb-6">
              <img 
                src={nmapScan} 
                alt="Nmap Scan Results" 
                className="rounded-lg shadow-md w-full max-w-2xl mx-auto"
              />
              <p className="text-sm text-gray-500 text-center mt-2">Figure 2: Nmap scan results showing open ports</p>
            </div>
            
            <div className="mb-6">
              <img 
                src={zapResults} 
                alt="ZAP Automated Scan Results" 
                className="rounded-lg shadow-md w-full max-w-2xl mx-auto"
              />
              <p className="text-sm text-gray-500 text-center mt-2">Figure 8: ZAP automated scan results</p>
            </div>
            
            <p className="text-gray-600">
              The website uses Apache HTTPD 2.4.25 (with known vulnerabilities) and OpenSSH. The technology stack includes:
            </p>
            <ul className="list-disc pl-5 text-gray-600 mt-2 space-y-1">
              <li>HTML for page structure</li>
              <li>JavaScript for interactivity</li>
              <li>CSS for styling</li>
              <li>SQL database for data storage</li>
              <li>PHP for server-side processing</li>
            </ul>
          </motion.div>

          {/* Vulnerabilities Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Critical Vulnerabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vulnerabilities.map((vuln, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start mb-4">
                    <div className="p-2 rounded-lg bg-opacity-20 mr-4">
                      {vuln.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-semibold text-gray-900">{vuln.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          vuln.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                          vuln.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {vuln.severity}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{vuln.description}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Key Findings:</h4>
                    <ul className="space-y-1">
                      {vuln.findings.map((finding, i) => (
                        <li key={i} className="flex items-start">
                          <FiAlertTriangle className="text-yellow-500 mt-0.5 mr-2 flex-shrink-0" size={14} />
                          <span className="text-gray-600 text-sm">{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {vuln.figures && vuln.figures.map((figure, idx) => (
                    <div key={idx} className="mt-4">
                      <img 
                        src={figure.image} 
                        alt={figure.caption} 
                        className="rounded-lg shadow-sm border border-gray-200 w-full"
                      />
                      <p className="text-sm text-gray-500 mt-1">{figure.caption}</p>
                    </div>
                  ))}
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Recommended Fix:</h4>
                    <p className="text-gray-600 text-sm italic">{vuln.remediation}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Action Required */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <FiAlertTriangle className="text-yellow-500 mr-2" /> Immediate Action Required
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FiAlertTriangle className="text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">Update Apache server to latest version</p>
                  <p className="text-gray-600 text-sm">Current version has known CVEs</p>
                </div>
              </li>
              <li className="flex items-start">
                <FiAlertTriangle className="text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">Implement password hashing</p>
                  <p className="text-gray-600 text-sm">Plaintext passwords must be encrypted immediately</p>
                </div>
              </li>
              <li className="flex items-start">
                <FiAlertTriangle className="text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">Patch SQL injection vulnerabilities</p>
                  <p className="text-gray-600 text-sm">Use prepared statements for all database queries</p>
                </div>
              </li>
            </ul>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Need Help Securing Your Application?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Contact our security team for detailed technical analysis and remediation guidance
            </p>
            <Link 
              to="/contact" 
              className="inline-block px-8 py-4 bg-white hover:bg-gray-100 text-blue-600 font-medium rounded-lg shadow-lg transition-all duration-300"
            >
              Contact Security Team
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
