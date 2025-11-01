// src/pages/public/AboutPage.jsx
import { FiBookOpen, FiUsers, FiTarget, FiHeart } from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";

const AboutPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-3 sm:px-4 py-8 sm:py-12 bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="text-center mb-12 sm:mb-16 lg:mb-20 max-w-4xl">
        <div className="relative inline-block">
          <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-gray-700 to-green-600 rounded-xl sm:rounded-2xl blur-xl opacity-20"></div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white relative">
            About{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-green-600 dark:from-gray-300 dark:to-green-400">
              Communiversity
            </span>
          </h1>
        </div>

        <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mt-4 sm:mt-6 lg:mt-8 leading-relaxed px-2">
          At{" "}
          <span className="font-semibold text-green-600 dark:text-green-400">
            Communiversity
          </span>
          , we believe knowledge should be{" "}
          <span className="font-semibold">accessible</span> to all. Our mission
          is to create a digital library that empowers learners, teachers, and
          communities worldwide.
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 max-w-5xl sm:max-w-6xl mb-12 sm:mb-16 lg:mb-20">
        <Card className="p-6 sm:p-8 text-center group hover:scale-105 transition-transform duration-300">
          <div className="mx-auto bg-gradient-to-br from-gray-100 to-green-100 dark:from-gray-700 dark:to-green-900/30 p-3 sm:p-4 rounded-lg sm:rounded-xl mb-4 sm:mb-6 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 flex items-center justify-center">
            <FiTarget className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Our Mission
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
            To organize knowledge systematically and provide instant access to
            resources that inspire curiosity, creativity, and lifelong learning.
          </p>
        </Card>

        <Card className="p-6 sm:p-8 text-center group hover:scale-105 transition-transform duration-300">
          <div className="mx-auto bg-gradient-to-br from-gray-100 to-green-100 dark:from-gray-700 dark:to-green-900/30 p-3 sm:p-4 rounded-lg sm:rounded-xl mb-4 sm:mb-6 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 flex items-center justify-center">
            <FiBookOpen className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Our Vision
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
            A world where every learner has equal access to knowledge, no matter
            where they are or what resources they have.
          </p>
        </Card>
      </section>

      {/* Values */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl sm:max-w-6xl mb-12 sm:mb-16 lg:mb-20">
        <Card className="p-4 sm:p-6 text-center hover:scale-105 transition-transform duration-300">
          <FiHeart className="mx-auto h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-green-600 dark:text-green-400 mb-2 sm:mb-3 lg:mb-4" />
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
            Inclusivity
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
            We celebrate diversity and believe in equal opportunities for all
            learners.
          </p>
        </Card>

        <Card className="p-4 sm:p-6 text-center hover:scale-105 transition-transform duration-300">
          <FiUsers className="mx-auto h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-green-600 dark:text-green-400 mb-2 sm:mb-3 lg:mb-4" />
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
            Community
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
            Building connections between students, educators, and knowledge
            enthusiasts.
          </p>
        </Card>

        <Card className="p-4 sm:p-6 text-center hover:scale-105 transition-transform duration-300">
          <FiBookOpen className="mx-auto h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-green-600 dark:text-green-400 mb-2 sm:mb-3 lg:mb-4" />
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
            Knowledge
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
            We value curiosity and the pursuit of truth, one book at a time.
          </p>
        </Card>
      </section>

      {/* CTA */}
      <section className="text-center mb-12 sm:mb-16 lg:mb-20 max-w-2xl sm:max-w-3xl">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
          Join Our Knowledge Journey
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed px-2">
          Whether you're a student, a researcher, or simply a curious mind,
          <span className="font-semibold text-green-600 dark:text-green-400">
            {" "}
            Communiversity
          </span>
          is here to guide you on your path of discovery.
        </p>
        <Button
          variant="primary"
          className="px-6 sm:px-8 lg:px-10 py-3 sm:py-4 text-sm sm:text-base lg:text-lg shadow-lg hover:scale-105 transition-transform duration-300"
        >
          Start Exploring
        </Button>
      </section>
    </div>
  );
};

export default AboutPage;
