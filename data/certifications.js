/**
 * Keerthana Devan — Personal Portfolio
 * Certifications Data Source
 * Reference: PRD v1.0 Section 4.5, 4.6 & 5.4
 */

const certificationsData = [
  {
    id: "cert-python-web",
    title: "Python Programming & Web Designing Internship",
    category: "Internships",
    publisher: "Code Design Technologies Pvt Ltd",
    issueDate: "May 2024",
    description: "Completed intensive practical training covering modern Python application scripting, web interface structuring, and full-stack software development workflows.",
    image: "assets/certificates/python-web-cert.png",
    previewUrl: "assets/certificates/python-web-cert.png"
  },
  {
    id: "cert-cpp-internship",
    title: "C/C++ Internship",
    category: "Internships",
    publisher: "Cognifyz Technologies",
    issueDate: "June 2024",
    description: "Hands-on software internship focused on algorithmic problem solving, memory management, object-oriented concepts, and robust C/C++ engineering practices.",
    image: "assets/certificates/cpp-internship-cert.png",
    previewUrl: "assets/certificates/cpp-internship-cert.png"
  },
  {
    id: "cert-sql-python-workshop",
    title: "SQL & Python Workshop Series (Phase-1)",
    category: "Workshops",
    publisher: "IEDC",
    issueDate: "February 2024",
    description: "Intensive workshop program on relational database query design, schema normalization, and Python data manipulation techniques.",
    image: "assets/certificates/sql-python-workshop-cert.png",
    previewUrl: "assets/certificates/sql-python-workshop-cert.png"
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = certificationsData;
}

