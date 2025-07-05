// src/app/contact/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";

async function getContactInfo() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'singleton' },
      select: {
        contactEmail: true,
        contactPhone: true,
        contactAddress: true,
        contactHours: true,
      },
    });
    return settings;
  } catch (error) {
    console.error('Failed to fetch contact info:', error);
    return null;
  }
}

export default async function ContactPage() {
  const contactInfo = await getContactInfo();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground">
            Get in touch with our team - we&apos;re here to help!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="How can we help?" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Tell us more about your inquiry..."
                  rows={6}
                />
              </div>
              
              <Button className="w-full">Send Message</Button>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo?.contactPhone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-muted-foreground">{contactInfo.contactPhone}</p>
                    </div>
                  </div>
                )}
                
                {contactInfo?.contactEmail && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">{contactInfo.contactEmail}</p>
                    </div>
                  </div>
                )}
                
                {contactInfo?.contactAddress && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {contactInfo.contactAddress}
                      </p>
                    </div>
                  </div>
                )}
                
                {contactInfo?.contactHours && (
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Business Hours</p>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {contactInfo.contactHours}
                      </p>
                    </div>
                  </div>
                )}

                {/* Fallback contact info if no settings are available */}
                {!contactInfo && (
                  <>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-muted-foreground">+254 700 123 456</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-muted-foreground">info@fishnfresh.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <p className="font-medium">Address</p>
                        <p className="text-muted-foreground">
                          123 Event Street<br />
                          Nairobi, Kenya
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Business Hours</p>
                        <p className="text-muted-foreground">
                          Mon - Fri: 9:00 AM - 6:00 PM<br />
                          Sat: 10:00 AM - 4:00 PM<br />
                          Sun: Closed
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">How do I find my tickets?</h3>
                  <p className="text-sm text-muted-foreground">
                    Use our &quot;Find Tickets&quot; feature with your email address or ticket code.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Can I get a refund?</h3>
                  <p className="text-sm text-muted-foreground">
                    Refund policies vary by event. Please check with the event organizer.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">How do I contact event organizers?</h3>
                  <p className="text-sm text-muted-foreground">
                    Event organizer contact information is available on each event page.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
