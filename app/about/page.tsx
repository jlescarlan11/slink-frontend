import React from "react";
import { Link2, Zap, Shield, BarChart3, Globe, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const AboutPage: React.FC = () => {
  const features = [
    {
      icon: <Link2 className="w-6 h-6" />,
      title: "Smart Link Shortening",
      description:
        "Transform long, unwieldy URLs into clean, memorable links that are perfect for sharing across any platform.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description:
        "Built with Next.js and optimized for speed. Your shortened links redirect instantly with minimal latency.",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Detailed Analytics",
      description:
        "Track clicks, geographic data, referrer sources, and engagement metrics to understand your audience better.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Reliable",
      description:
        "Enterprise-grade security ensures your links are protected with 99.9% uptime guarantee.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global CDN",
      description:
        "Distributed worldwide for optimal performance, ensuring fast access from anywhere on the globe.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Collaboration",
      description:
        "Share and manage links across your team with collaborative workspaces and access controls.",
    },
  ];

  const techStack = [
    { category: "Frontend", tech: "Next.js with TypeScript", badge: "React" },
    {
      category: "Performance",
      tech: "Edge computing and global CDN",
      badge: "Fast",
    },
    {
      category: "Security",
      tech: "Enterprise-grade protection",
      badge: "Secure",
    },
  ];

  const stats = [
    { value: "10M+", label: "Links Shortened" },
    { value: "50K+", label: "Active Users" },
    { value: "99.9%", label: "Uptime" },
    { value: "150+", label: "Countries" },
  ];

  return (
    <ProtectedRoute>
      <div className="section-spacing">
        <div>
          {/* Hero Section */}
          <div className="text-center mb-16 space-y-8">
            <div className="flex items-center  justify-center gap-4">
              <Link2 className="w-16 h-16" />
              <h1>
                About <span>Slink</span>
              </h1>
            </div>
            <p>
              Slink is a modern, powerful link shortening service designed to
              help individuals and businesses create, manage, and track their
              links with precision and ease. Built with cutting-edge technology
              for the modern web.
            </p>
          </div>

          {/* Mission Statement */}
          <Card className="mb-16 border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="card-h2">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We believe that every link should be meaningful, measurable, and
                manageable. Slink empowers users to take control of their
                digital presence by providing intuitive tools that transform
                simple URL shortening into a comprehensive link management
                platform.
              </p>
              <p>
                Whether you&apos;re a content creator, marketer, developer, or
                business owner, Slink provides the insights and reliability you
                need to optimize your link strategy and connect with your
                audience more effectively.
              </p>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="mb-16 space-y-8">
            <h2 className="card-h2 text-center">Why Choose Slink?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <CardHeader>
                    <CardTitle className="card-h3">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Technology Stack */}
          <Card className="mb-16 bg-card border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="card-h2">
                Built with Modern Technology
              </CardTitle>
              <CardDescription className="text-sm lg:text-lg max-w-2xl mx-auto">
                Slink is powered by a robust technology stack designed for
                performance, scalability, and reliability.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {techStack.map((item, index) => (
                  <div
                    key={index}
                    className="bg-muted/50 rounded-lg p-6 text-center"
                  >
                    <Badge variant="secondary" className="mb-3">
                      {item.badge}
                    </Badge>
                    <h3 className="card-h3 text-foreground">{item.category}</h3>
                    <p className="text-sm text-muted-foreground">{item.tech}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats Section */}
          <div className="text-center mb-16">
            <h2 className="card-h2 mb-8">Trusted by Users Worldwide</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="border-0 shadow-md">
                  <CardContent className="pt-6 text-center">
                    <div className="card-h3 text-foreground mb-2">
                      {stat.value}
                    </div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-primary to-primary/80 border-0 shadow-lg">
            <CardContent className="p-8 text-center text-primary-foreground">
              <h2>Ready to Get Started?</h2>
              <p className="!text-primary-foreground/80 max-w-2xl mx-auto">
                Join thousands of users who trust Slink for their link
                management needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary">
                  Start Shortening
                </Button>
                <Button size="lg">View Pricing</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AboutPage;
