export default function AboutPage() {
  return (
    <>
      <main className="min-h-screen">
        <section className="py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl space-y-10">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">About IMED</h1>
                <p className="text-xl text-muted-foreground">
                  Empowering health decisions through AI-powered medicine recommendations.
                </p>
              </div>
              
              <div className="prose prose-blue max-w-none">
                <p>
                  Welcome to IMED, a cutting-edge platform designed to bridge the gap between advanced AI technology and healthcare. Our mission is to provide accessible, accurate, and personalized medicine recommendations to help users make informed decisions about their health.
                </p>
                
                <h2>Our Mission</h2>
                <p>
                  At IMED, we believe in democratizing access to healthcare information. Our platform leverages the power of artificial intelligence to analyze symptoms and provide tailored medicine recommendations based on the latest medical knowledge. We aim to empower individuals with reliable information while emphasizing the importance of consulting healthcare professionals for definitive diagnoses and treatment plans.
                </p>
                
                <h2>How IMED Works</h2>
                <p>
                  IMED utilizes advanced AI models that have been trained on comprehensive medical datasets. When users input their symptoms and health information, our system analyzes this data and generates personalized medicine recommendations. The AI considers factors such as symptom profiles, medical history, age, and other relevant details to provide the most appropriate suggestions.
                </p>
                <p>
                  We offer multiple AI model options, including open-source models like Mistral and Llama, ensuring that our service remains accessible to all users without requiring costly subscriptions.
                </p>
                
                <h2>Our Commitment to Safety</h2>
                <p>
                  IMED is designed to be an informational resource, not a replacement for professional medical advice. We strictly adhere to responsible AI practices by:
                </p>
                <ul>
                  <li>Providing general information rather than specific prescriptions</li>
                  <li>Including clear disclaimers with all recommendations</li>
                  <li>Emphasizing the importance of consulting healthcare professionals</li>
                  <li>Continuously updating our models with the latest medical research</li>
                  <li>Prioritizing user privacy and data security</li>
                </ul>
                
                <h2>The Team Behind IMED</h2>
                <p>
                  IMED was developed by a multidisciplinary team of AI researchers, healthcare professionals, and software engineers passionate about improving healthcare access through technology. Our team combines expertise in machine learning, medical knowledge, and user-centered design to create a platform that is both powerful and easy to use.
                </p>
                
                <h2>Looking Ahead</h2>
                <p>
                  We are constantly working to improve IMED's capabilities and expand our services. Future developments include:
                </p>
                <ul>
                  <li>Enhanced recommendation accuracy through continuous model training</li>
                  <li>Integration with wearable health devices for more personalized insights</li>
                  <li>Expanded language support to serve diverse communities</li>
                  <li>Collaborative features for sharing information with healthcare providers</li>
                </ul>
                
                <h2>Contact Us</h2>
                <p>
                  We value your feedback and are committed to continuously improving our platform. If you have questions, suggestions, or concerns, please don't hesitate to reach out to our team at <a href="mailto:info@imed.com">info@imed.com</a>.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
} 