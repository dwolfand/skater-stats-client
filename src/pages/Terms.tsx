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

export default function Terms() {
  useScrollToTop();

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            Terms of Service
          </Heading>
        </Box>

        <Box>
          <Heading size="md" mb={3}>
            1. Acceptance of Terms
          </Heading>
          <Text>
            By accessing and using Skater Stats ("the Service"), you agree to be
            bound by these Terms of Service. If you do not agree to these terms,
            please do not use the Service.
          </Text>
        </Box>

        <Box>
          <Heading size="md" mb={3}>
            2. Description of Service
          </Heading>
          <Text mb={3}>
            Skater Stats is a platform that provides figure skating statistics,
            competition results, and performance analysis. The Service includes:
          </Text>
          <List spacing={2} styleType="disc" pl={6}>
            <ListItem>
              Access to figure skating competition data and results
            </ListItem>
            <ListItem>Statistical analysis of skater performance</ListItem>
            <ListItem>AI-powered performance analysis</ListItem>
            <ListItem>Real-time competition updates</ListItem>
            <ListItem>User accounts with personalized features</ListItem>
          </List>
        </Box>

        <Box>
          <Heading size="md" mb={3}>
            3. User Accounts
          </Heading>
          <Text mb={3}>
            To access certain features of the Service, you must create an
            account. You agree to:
          </Text>
          <List spacing={2} styleType="disc" pl={6}>
            <ListItem>Provide accurate and complete information</ListItem>
            <ListItem>
              Maintain the security of your account credentials
            </ListItem>
            <ListItem>
              Accept responsibility for all activities under your account
            </ListItem>
            <ListItem>Notify us immediately of any security breaches</ListItem>
          </List>
        </Box>

        <Box>
          <Heading size="md" mb={3}>
            4. User Conduct
          </Heading>
          <Text mb={3}>You agree not to:</Text>
          <List spacing={2} styleType="disc" pl={6}>
            <ListItem>Use the Service for any illegal purposes</ListItem>
            <ListItem>
              Attempt to access unauthorized areas of the Service
            </ListItem>
            <ListItem>
              Interfere with or disrupt the Service's operation
            </ListItem>
            <ListItem>Share your account credentials with others</ListItem>
            <ListItem>
              Use automated systems or software to extract data
            </ListItem>
          </List>
        </Box>

        <Box>
          <Heading size="md" mb={3}>
            5. Intellectual Property
          </Heading>
          <Text>
            All content, features, and functionality of the Service, including
            but not limited to text, graphics, logos, and software, are the
            exclusive property of Skater Stats and are protected by U.S. and
            international copyright, trademark, and other intellectual property
            laws.
          </Text>
        </Box>

        <Box>
          <Heading size="md" mb={3}>
            6. Data Usage and Privacy
          </Heading>
          <Text>
            Your use of the Service is also governed by our Privacy Policy. By
            using the Service, you agree to our collection and use of
            information as detailed in the Privacy Policy.
          </Text>
        </Box>

        <Box>
          <Heading size="md" mb={3}>
            7. Disclaimer of Warranties
          </Heading>
          <Text>
            The Service is provided "as is" without any warranties, either
            express or implied. We do not guarantee the accuracy, completeness,
            or usefulness of the Service.
          </Text>
        </Box>

        <Box>
          <Heading size="md" mb={3}>
            8. Limitation of Liability
          </Heading>
          <Text>
            Skater Stats shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages resulting from your use
            of or inability to use the Service.
          </Text>
        </Box>

        <Box>
          <Heading size="md" mb={3}>
            9. Changes to Terms
          </Heading>
          <Text>We reserve the right to modify these terms at any time.</Text>
        </Box>

        <Box>
          <Heading size="md" mb={3}>
            10. Contact Information
          </Heading>
          <Text>
            For questions about these Terms of Service, please contact us
            through the Report an Issue form at the bottom of the page.
          </Text>
        </Box>
      </VStack>
    </Container>
  );
}
