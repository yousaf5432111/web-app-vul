import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-700 text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between">
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h3 className="text-lg font-semibold">WebVulnLearn</h3>
            <p className="text-sm">Learn and test web vulnerabilities safely.</p>
          </div>
          <div className="w-full md:w-1/3">
            <h4 className="text-sm font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:underline">About</Link></li>
              <li><Link to="/contact" className="hover:underline">Contact</Link></li>
            </ul>
          </div>
          <div className="w-full md:w-1/3">
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="hover:underline">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:underline">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center text-sm">
          © {new Date().getFullYear()} WebVulnLearn. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
