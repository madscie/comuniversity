import { FiBookOpen, FiUsers, FiTarget, FiHeart } from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";

const AboutPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Hero Section */}
      <section className="text-center mb-20 mt-12 max-w-4xl">
        <div className="relative inline-block">
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-2xl blur-2xl opacity-30"></div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 relative">
            About{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Communiversity
            </span>
          </h1>
        </div>

        <p className="text-xl text-gray-700 mt-8 leading-relaxed">
          At <span className="font-semibold text-purple-600">Communiversity</span>, 
          we believe knowledge should be <span className="font-semibold">accessible</span> to all.  
          Our mission is to create a digital library that empowers learners, 
          teachers, and communities worldwide.
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="grid md:grid-cols-2 gap-10 max-w-6xl mb-20">
        <Card className="p-8 text-center group hover:scale-105 transition-transform duration-300">
          <div className="mx-auto bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-2xl mb-6 w-20 h-20 flex items-center justify-center">
            <FiTarget className="h-10 w-10 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
          <p className="text-gray-600 leading-relaxed">
            To organize knowledge systematically and provide instant access to 
            resources that inspire curiosity, creativity, and lifelong learning.
          </p>
        </Card>

        <Card className="p-8 text-center group hover:scale-105 transition-transform duration-300">
          <div className="mx-auto bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-2xl mb-6 w-20 h-20 flex items-center justify-center">
            <FiBookOpen className="h-10 w-10 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
          <p className="text-gray-600 leading-relaxed">
            A world where every learner has equal access to knowledge, 
            no matter where they are or what resources they have.
          </p>
        </Card>
      </section>

      {/* Values */}
      <section className="grid md:grid-cols-3 gap-8 max-w-6xl mb-20">
        <Card className="p-6 text-center hover:scale-105 transition-transform duration-300">
          <FiHeart className="mx-auto h-10 w-10 text-pink-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Inclusivity</h3>
          <p className="text-gray-600">We celebrate diversity and believe in equal opportunities for all learners.</p>
        </Card>

        <Card className="p-6 text-center hover:scale-105 transition-transform duration-300">
          <FiUsers className="mx-auto h-10 w-10 text-indigo-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Community</h3>
          <p className="text-gray-600">Building connections between students, educators, and knowledge enthusiasts.</p>
        </Card>

        <Card className="p-6 text-center hover:scale-105 transition-transform duration-300">
          <FiBookOpen className="mx-auto h-10 w-10 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Knowledge</h3>
          <p className="text-gray-600">We value curiosity and the pursuit of truth, one book at a time.</p>
        </Card>
      </section>

      {/* CTA */}
      <section className="text-center mb-20 max-w-3xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Join Our Knowledge Journey
        </h2>
        <p className="text-gray-700 mb-8 leading-relaxed">
          Whether you’re a student, a researcher, or simply a curious mind, 
          <span className="font-semibold text-purple-600"> Communiversity</span> 
          is here to guide you on your path of discovery.
        </p>
        <Button
          variant="gradient"
          size="lg"
          className="px-10 py-4 text-lg shadow-lg hover:scale-105 transition-transform duration-300"
        >
          Start Exploring
        </Button>
      </section>
    </div>
  );
};

export default AboutPage;
