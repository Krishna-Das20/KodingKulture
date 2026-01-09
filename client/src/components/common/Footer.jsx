import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark-900 border-t border-dark-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-3">
              <span className="text-primary-500">FAKT</span>
              <span className="text-white"> CHECK</span>
            </h3>
            <p className="text-gray-400 text-sm">
              A professional platform for weekly coding contests, MCQ tests, and skill assessments.
              Kompete, Kode, and Konquer with us!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/contests" className="text-gray-400 hover:text-primary-500 text-sm transition-colors">Browse Contests</a></li>
              <li><a href="/leaderboard" className="text-gray-400 hover:text-primary-500 text-sm transition-colors">Leaderboard</a></li>
              <li><a href="/about" className="text-gray-400 hover:text-primary-500 text-sm transition-colors">About Us</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-primary-500 text-sm transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-3">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="bg-dark-800 p-2 rounded-lg hover:bg-primary-500 transition-colors duration-200">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="bg-dark-800 p-2 rounded-lg hover:bg-primary-500 transition-colors duration-200">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="bg-dark-800 p-2 rounded-lg hover:bg-primary-500 transition-colors duration-200">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="bg-dark-800 p-2 rounded-lg hover:bg-primary-500 transition-colors duration-200">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-dark-800 mt-8 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} FAKT CHECK. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
