import {
  FiBookOpen,
  FiUsers,
  FiTarget,
  FiHeart,
  FiAward,
  FiGlobe,
} from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import { componentClasses } from "../../components/UI/TailwindColors";

const AboutPage = () => {
  const stats = [
    { number: "2.5K+", label: "Books Available" },
    { number: "150+", label: "Categories" },
    { number: "50K+", label: "Active Readers" },
    { number: "24/7", label: "Access" },
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "Head Librarian",
      description: "10+ years in digital library management",
      icon: FiBookOpen,
    },
    {
      name: "Michael Chen",
      role: "Tech Lead",
      description: "Full-stack developer & system architect",
      icon: FiUsers,
    },
    {
      name: "Emily Davis",
      role: "Content Curator",
      description: "Expert in educational resource organization",
      icon: FiAward,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 sm:-top-32 sm:-right-32 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-green-100 dark:bg-green-900/20 rounded-full blur-2xl sm:blur-3xl opacity-30" />
          <div className="absolute -bottom-20 -left-20 sm:-bottom-32 sm:-left-32 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-gray-100 dark:bg-gray-800/30 rounded-full blur-2xl sm:blur-3xl opacity-30" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-block mb-8">
            <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-gray-700 to-green-600 rounded-xl sm:rounded-2xl blur-xl opacity-20"></div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white relative">
              About{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-green-600 dark:from-gray-300 dark:to-green-400">
                Communiversity
              </span>
            </h1>
          </div>

          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mt-4 sm:mt-6 lg:mt-8 leading-relaxed px-2 max-w-3xl mx-auto">
            At{" "}
            <span className="font-semibold text-green-600 dark:text-green-400">
              Communiversity
            </span>
            , we believe knowledge should be{" "}
            <span className="font-semibold">accessible to all</span>. Our
            mission is to create a digital library that empowers learners,
            teachers, and communities worldwide through innovative technology
            and curated content.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-2 group-hover:scale-105 transition-transform duration-300 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black text-gray-900 dark:text-white mb-1">
                    {stat.number}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
          <Card className="p-6 sm:p-8 text-center group hover:scale-105 transition-all duration-300 border-0 shadow-lg">
            <div className="mx-auto bg-gradient-to-br from-gray-800 to-green-600 dark:from-gray-700 dark:to-green-800 p-3 sm:p-4 rounded-lg sm:rounded-xl mb-4 sm:mb-6 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 flex items-center justify-center">
              <FiTarget className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Our Mission
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
              To organize knowledge systematically using advanced Dewey Decimal
              classification and provide instant access to resources that
              inspire curiosity, creativity, and lifelong learning for everyone,
              everywhere.
            </p>
          </Card>

          <Card className="p-6 sm:p-8 text-center group hover:scale-105 transition-all duration-300 border-0 shadow-lg">
            <div className="mx-auto bg-gradient-to-br from-gray-800 to-green-600 dark:from-gray-700 dark:to-green-800 p-3 sm:p-4 rounded-lg sm:rounded-xl mb-4 sm:mb-6 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 flex items-center justify-center">
              <FiGlobe className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Our Vision
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
              A world where every learner has equal access to knowledge,
              breaking down geographical and economic barriers through digital
              innovation and community-driven educational resources.
            </p>
          </Card>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Core Values
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
              The principles that guide everything we do at Communiversity
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <Card className="p-4 sm:p-6 text-center hover:scale-105 transition-all duration-300 border-0 shadow-md">
              <div className="mx-auto bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 p-3 rounded-lg mb-3 sm:mb-4 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
                <FiHeart className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Inclusivity
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">
                We celebrate diversity and believe in equal opportunities for
                all learners, regardless of background or circumstances.
              </p>
            </Card>

            <Card className="p-4 sm:p-6 text-center hover:scale-105 transition-all duration-300 border-0 shadow-md">
              <div className="mx-auto bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 p-3 rounded-lg mb-3 sm:mb-4 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
                <FiUsers className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Community
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">
                Building meaningful connections between students, educators,
                researchers, and knowledge enthusiasts worldwide.
              </p>
            </Card>

            <Card className="p-4 sm:p-6 text-center hover:scale-105 transition-all duration-300 border-0 shadow-md">
              <div className="mx-auto bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 p-3 rounded-lg mb-3 sm:mb-4 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
                <FiBookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Knowledge
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">
                We value curiosity, critical thinking, and the pursuit of truth,
                empowering learners one book at a time.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Meet Our Team
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
              Passionate professionals dedicated to revolutionizing digital
              education
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {team.map((member, index) => (
              <Card
                key={index}
                className="p-6 text-center group hover:scale-105 transition-all duration-300 border-0 shadow-lg"
              >
                <div className="mx-auto bg-gradient-to-br from-gray-800 to-green-600 dark:from-gray-700 dark:to-green-800 p-4 rounded-2xl mb-4 w-16 h-16 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <member.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {member.name}
                </h3>
                <p className="text-green-600 dark:text-green-400 font-semibold mb-2">
                  {member.role}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {member.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4 sm:mb-6">
            Join Our Knowledge Journey
          </h2>
          <p className="text-gray-300 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto">
            Whether you're a student, researcher, educator, or simply a curious
            mind,
            <span className="font-semibold text-green-400">
              {" "}
              Communiversity{" "}
            </span>
            is here to guide you on your path of discovery and lifelong
            learning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="success"
              className="px-6 sm:px-8 lg:px-10 py-3 sm:py-4 text-sm sm:text-base lg:text-lg shadow-lg hover:scale-105 transition-transform duration-300"
            >
              Start Exploring Now
            </Button>
            <Button
              variant="outline"
              className="px-6 sm:px-8 lg:px-10 py-3 sm:py-4 text-sm sm:text-base lg:text-lg border-white text-white hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
