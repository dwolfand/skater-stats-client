import React from "react";
import {
  Container,
  Heading,
  Text,
  VStack,
  List,
  ListItem,
  Box,
} from "@chakra-ui/react";
import { useScrollToTop } from "../hooks/useScrollToTop";

export default function Privacy() {
  useScrollToTop();

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            Privacy Policy
          </Heading>
        </Box>

        <Box>
          <Heading size="md" mb={3}>
            1. Information We Collect
          </Heading>
          <Heading size="sm" mb={2}>
            1.1 Information You Provide
          </Heading>
          <Text mb={3}>When you use Skater Stats, we collect:</Text>
          <List spacing={2} styleType="disc" pl={6}>
            <ListItem>
              Account information (name, email) when you sign up using Google
            </ListItem>
            <ListItem>
              Profile picture (optional) from your Google account
            </ListItem>
            <ListItem>
              Profile customization data including:
              <List spacing={1} styleType="circle" pl={6} mt={2}>
                <ListItem>Profile and cover images you upload</ListItem>
                <ListItem>Gallery images you upload</ListItem>
                <ListItem>Biography and personal information</ListItem>
                <ListItem>Social media links</ListItem>
                <ListItem>Achievements and goals</ListItem>
                <ListItem>Theme preferences</ListItem>
              </List>
            </ListItem>
            <ListItem>Feedback and bug reports you submit</ListItem>
            <ListItem>Your preferences and settings</ListItem>
          </List>

          <Heading size="sm" mb={2} mt={4}>
            1.2 Information Automatically Collected
          </Heading>
          <Text mb={3}>We automatically collect:</Text>
          <List spacing={2} styleType="disc" pl={6}>
            <ListItem>
              Usage data and analytics through Google Analytics
            </ListItem>
            <ListItem>Device information and browser type</ListItem>
            <ListItem>IP address and location data</ListItem>
            <ListItem>Cookies and local storage data</ListItem>
          </List>
        </Box>

        <Box>
          <Heading size="md" mb={3}>
            2. How We Use Your Information
          </Heading>
          <Text mb={3}>We use the collected information to:</Text>
          <List spacing={2} styleType="disc" pl={6}>
            <ListItem>Provide and maintain the Service</ListItem>
            <ListItem>Improve and personalize your experience</ListItem>
            <ListItem>Analyze usage patterns and trends</ListItem>
            <ListItem>Monitor and enforce content guidelines</ListItem>
            <ListItem>Respond to your feedback and support requests</ListItem>
            <ListItem>Send important updates about the Service</ListItem>
          </List>
        </Box>

        <Box>
          <Heading size="md" mb={3}>
            3. Data Storage and Security
          </Heading>
          <Text mb={3}>
            We implement appropriate security measures to protect your
            information:
          </Text>
          <List spacing={2} styleType="disc" pl={6}>
            <ListItem>
              Data is stored securely in AWS cloud infrastructure
            </ListItem>
            <ListItem>Passwords and sensitive data are encrypted</ListItem>
            <ListItem>
              User-uploaded images are stored securely in AWS S3 with strict
              access controls
            </ListItem>
            <ListItem>
              Content is monitored for compliance with our guidelines
            </ListItem>
            <ListItem>Regular security audits are performed</ListItem>
            <ListItem>Access to personal data is strictly controlled</ListItem>
          </List>
        </Box>

        <Box>
          <Heading size="md" mb={3}>
            4. Third-Party Services
          </Heading>
          <Text mb={3}>We use the following third-party services:</Text>
          <List spacing={2} styleType="disc" pl={6}>
            <ListItem>Google Analytics for usage tracking</ListItem>
            <ListItem>Google Sign-In for authentication</ListItem>
            <ListItem>AWS S3 for secure image storage</ListItem>
            <ListItem>Anthropic AI for performance analysis</ListItem>
            <ListItem>AWS for hosting and data storage</ListItem>
          </List>
        </Box>

        <Box>
          <Heading size="md" mb={3}>
            5. Cookies and Local Storage
          </Heading>
          <Text mb={3}>We use:</Text>
          <List spacing={2} styleType="disc" pl={6}>
            <ListItem>Authentication tokens for secure login</ListItem>
            <ListItem>Local storage for user preferences</ListItem>
            <ListItem>Session cookies for maintaining your session</ListItem>
            <ListItem>Analytics cookies to understand usage patterns</ListItem>
          </List>
        </Box>

        <Box>
          <Heading size="md" mb={3}>
            6. Your Rights
          </Heading>
          <Text mb={3}>You have the right to:</Text>
          <List spacing={2} styleType="disc" pl={6}>
            <ListItem>Access your personal data</ListItem>
            <ListItem>Correct inaccurate data</ListItem>
            <ListItem>Request deletion of your data</ListItem>
            <ListItem>Opt-out of analytics tracking</ListItem>
            <ListItem>Export your data</ListItem>
          </List>
        </Box>

        <Box>
          <Heading size="md" mb={3}>
            7. Data Retention
          </Heading>
          <Text mb={3}>We retain your data for as long as necessary to:</Text>
          <List spacing={2} styleType="disc" pl={6}>
            <ListItem>Provide the Service</ListItem>
            <ListItem>Comply with legal obligations</ListItem>
            <ListItem>Resolve disputes</ListItem>
            <ListItem>Enforce our agreements</ListItem>
          </List>
        </Box>

        <Box>
          <Heading size="md" mb={3}>
            8. Children's Privacy
          </Heading>
          <Text>
            Our Service is not intended for children under 13. We do not
            knowingly collect personal information from children under 13.
          </Text>
        </Box>

        <Box>
          <Heading size="md" mb={3}>
            9. Changes to Privacy Policy
          </Heading>
          <Text>We may update this Privacy Policy from time to time.</Text>
        </Box>

        <Box>
          <Heading size="md" mb={3}>
            10. Contact Us
          </Heading>
          <Text>
            If you have any questions about this Privacy Policy, please contact
            us through the Feedback form at the bottom of the page.
          </Text>
        </Box>
      </VStack>
    </Container>
  );
}
