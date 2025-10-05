// in src/app/page.js
import Link from "next/link";
import { ArrowRight, Bot, BarChart, Users } from "lucide-react";

// A small component for feature cards
const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center p-6 text-center bg-gray-100 rounded-lg">
      {icon}
      <h3 className="mt-4 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-base text-gray-600">{description}</p>
    </div>
  );
};

export default function HomePage() {
  return (
    <div className="bg-white text-gray-800">
      {/* Header */}
     

      {/* Hero Section */}
      <main className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Aura: The Intelligent HRMS for the Future of Work
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Leveraging the power of generative AI to streamline operations, predict workforce needs, and build a better, more efficient workplace.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/dashboard"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Access Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-24 sm:py-32 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">Our Features</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to manage a modern workforce
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              <div className="relative pl-16">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-semibold leading-7 text-gray-900">AI-Powered Recruitment</h3>
                <p className="mt-2 text-base leading-7 text-gray-600">
                  Analyze resumes, generate interview questions, and identify top candidates in seconds, not hours.
                </p>
              </div>
              <div className="relative pl-16">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                  <BarChart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-semibold leading-7 text-gray-900">Predictive Analytics</h3>
                <p className="mt-2 text-base leading-7 text-gray-600">
                  Use our Attrition Intelligence model to identify flight risks and take proactive steps to retain your top talent.
                </p>
              </div>
              <div className="relative pl-16">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-semibold leading-7 text-gray-900">Unified Employee Management</h3>
                <p className="mt-2 text-base leading-7 text-gray-600">
                  A complete suite of tools for admins to manage profiles, track leave, monitor attendance, and handle internal reports.
                </p>
              </div>
              <div className="relative pl-16">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                  <ArrowRight className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-semibold leading-7 text-gray-900">Complete Workflows</h3>
                <p className="mt-2 text-base leading-7 text-gray-600">
                  Enable employees and managers with self-service tools for leave requests and approvals, streamlining daily operations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white">
        <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
          <p className="text-center text-xs leading-5 text-gray-500">
            &copy; 2025 Project Aura. A Hackathon Submission.
          </p>
        </div>
      </footer>
    </div>
  );
}