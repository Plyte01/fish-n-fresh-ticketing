// src/app/about/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fish, Users, Calendar, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 relative z-10">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">About FISH&apos;N FRESH</h1>
          <p className="text-xl text-muted-foreground">
            Your premier destination for discovering and experiencing the best events
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="mb-8 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <Fish className="h-6 w-6" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">
              At FISH&apos;N FRESH, we believe that great events bring people together and create lasting memories. 
              Our mission is to connect event organizers with enthusiastic attendees through a seamless, 
              secure, and user-friendly ticketing platform.
            </p>
          </CardContent>
        </Card>

        {/* Values */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Users className="h-5 w-5" />
                Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>We foster connections between event organizers and attendees, building stronger communities through shared experiences.</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Calendar className="h-5 w-5" />
                Innovation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>We continuously improve our platform with cutting-edge technology to make event management effortless.</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <Award className="h-5 w-5" />
                Excellence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>We strive for excellence in every aspect of our service, from user experience to customer support.</p>
            </CardContent>
          </Card>
        </div>

        {/* Team Section */}
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20">
          <CardHeader>
            <CardTitle className="text-cyan-600 dark:text-cyan-400">Our Story</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Founded in 2024, FISH&apos;N FRESH emerged from a simple idea: event ticketing should be 
                straightforward, secure, and accessible to everyone. We started as a small team of 
                developers and event enthusiasts who were frustrated with the complexity of existing 
                ticketing platforms.
              </p>
              <p>
                Today, we&apos;re proud to serve event organizers and attendees across Kenya and beyond, 
                providing a platform that makes discovering, purchasing, and managing event tickets 
                as easy as a few clicks.
              </p>
              <p>
                Whether you&apos;re organizing a small community gathering or a large-scale festival, 
                FISH&apos;N FRESH is here to help you succeed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
