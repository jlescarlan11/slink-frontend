"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart3,
  Check,
  ChevronRight,
  Globe,
  Link2,
  Shield,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

const Home = () => {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description:
        "Instant URL shortening with global CDN distribution for optimal performance.",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Analytics",
      description:
        "Detailed insights into clicks, locations, devices, and referrer data.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime guarantee.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Collaboration",
      description:
        "Share and manage links across your team with role-based access.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Custom Domains",
      description:
        "Use your own domain for branded short links and enhanced trust.",
    },
    {
      icon: <Link2 className="w-6 h-6" />,
      title: "Bulk Operations",
      description: "Shorten multiple URLs at once and manage them efficiently.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Marketing Director",
      company: "TechFlow",
      content:
        "Slink has revolutionized how we track our marketing campaigns. The analytics are incredibly detailed and actionable.",
      rating: 5,
    },
    {
      name: "Mike Rodriguez",
      role: "Content Creator",
      company: "@miketalkstech",
      content:
        "The custom domains feature is a game-changer. My audience trusts my links more, and I get better click-through rates.",
      rating: 5,
    },
    {
      name: "Emma Thompson",
      role: "Social Media Manager",
      company: "Creative Studio",
      content:
        "Managing hundreds of links across platforms was chaos before Slink. Now everything is organized and trackable.",
      rating: 5,
    },
  ];

  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for personal use",
      features: [
        "1,000 links per month",
        "Basic analytics",
        "Standard support",
      ],
    },
    {
      name: "Pro",
      price: "$19",
      description: "Great for professionals",
      features: [
        "25,000 links per month",
        "Advanced analytics",
        "Custom domains",
        "Priority support",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Built for teams",
      features: [
        "Unlimited links",
        "Team collaboration",
        "API access",
        "Dedicated support",
      ],
    },
  ];

  return (
    <div className="">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -80 }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-8 mb-20"
      >
        <div className="space-y-6">
          <h1 className="max-w-4xl mx-auto">
            Shorten URLs, <span className="text-primary">Amplify Results</span>
          </h1>
          <p className="max-w-2xl mx-auto">
            Create short, powerful links in seconds or manage your existing ones
            with detailed analytics. Your link management solution starts here.
          </p>
        </div>

        {/* Main Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <Button size="lg">
            <Link2 className="w-5 h-5 mr-2" />
            Shorten Link
          </Button>
          <div>
            <Button size="lg" variant="outline">
              <BarChart3 className="w-5 h-5 mr-2" />
              Manage Links
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            SSL Secured
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Instant Results
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Real-time Analytics
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: -80 }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="space-y-12 mb-20"
      >
        <div className="text-center space-y-4">
          <h2 className="card-h2">Why Choose Slink?</h2>
          <p className="max-w-2xl mx-auto">
            Powerful features designed to help you create, manage, and optimize
            your links like never before.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-md hover:shadow-lg transition-all duration-300 group"
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
      </motion.div>

      {/* Social Proof */}
      <motion.div
        initial={{ opacity: 0, y: -80 }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-20"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="card-h3 text-primary mb-2">10M+</div>
            <div className="text-sm text-muted-foreground">Links Created</div>
          </div>
          <div>
            <div className="card-h3 text-primary mb-2">50K+</div>
            <div className="text-sm text-muted-foreground">Happy Users</div>
          </div>
          <div>
            <div className="card-h3 text-primary mb-2">99.9%</div>
            <div className="text-sm text-muted-foreground">Uptime</div>
          </div>
          <div>
            <div className="card-h3 text-primary mb-2">150+</div>
            <div className="text-sm text-muted-foreground">Countries</div>
          </div>
        </div>

        <p className="text-muted-foreground">Trusted by companies worldwide</p>
      </motion.div>

      {/* Testimonials */}
      <motion.div
        initial={{ opacity: 0, y: -80 }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="space-y-12 mb-20"
      >
        <div className="text-center space-y-4">
          <h2 className="card-h2">What Our Users Say</h2>
          <p>See why thousands choose Slink for their link management needs.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex mb-4 items-center justify-center">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <blockquote className="text-sm mb-4">
                  &ldquo;{testimonial.content}&rdquo;
                </blockquote>
                <div>
                  <div className="font-semibold text-sm">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Pricing */}
      <motion.div
        initial={{ opacity: 0, y: -80 }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="space-y-12 mb-20"
      >
        <div className="text-center space-y-4">
          <h2 className="card-h2">Simple, Transparent Pricing</h2>
          <p>
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`border-0 shadow-md relative ${
                plan.popular ? "ring-2 ring-primary" : ""
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="card-h3">{plan.name}</CardTitle>
                <div className="space-y-2">
                  <div className="card-h2">
                    {plan.price}
                    {plan.price !== "Free" &&
                      plan.price !== "Custom" &&
                      "/month"}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  Get Started
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 border-0 shadow-lg">
        <CardContent className="p-12 text-center text-primary-foreground space-y-6">
          <h2>Ready to Transform Your Links?</h2>
          <p className="!text-primary-foreground/80 max-w-2xl mx-auto">
            Join thousands of users who trust Slink for their link management
            needs. Start shortening, tracking, and optimizing your URLs today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              <Link2 className="w-5 h-5 mr-2" />
              Start Shortening
            </Button>
            <Button size="lg">
              <BarChart3 className="w-5 h-5 mr-2" />
              Manage My Links
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
