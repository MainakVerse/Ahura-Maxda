'use client'
import { FC } from "react";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"; // Import Input component
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

// Define types for our configuration
export interface ToolConfig {
  [x: string]: any;
 

  wordCount: number;
  temperature: number;
  context: string;
  style: string;
  yearsOfExperience?: number; // Optional, only for Cover Letter
  company?: string; // Optional, only for Cover Letter
  role?: string; // Optional, only for Cover Letter
  jobDescription?: string; // Optional, only for Cover Letter
  beneficiaryName?: string; // Optional, only for Business Contract
  stakeholderName?: string; // Optional, only for Business Contract
  projectDescription?: string; // Optional, only for Business Contract
  duration?: number; // Optional, only for Business Contract
  title?: string; // Optional, only for IEEE Paper
  abstract?: string; // Optional, only for IEEE Paper
  keywords?: string; // Optional, only for IEEE Paper
}

export interface ToolbarProps {
  config: ToolConfig;
  onConfigChange: (newConfig: Partial<ToolConfig>) => void;
  isMobile?: boolean; // Add this line
}

// Generation parameters interface
export interface GenerationParams {
  wordCount: number;
  temperature: number;
  context: string;
  style: string;
  toolType: string;
  salary?:number;
  lastWorkingDay?: string; // Optional, only for Relieving Letter
  candidateName?: string; // Optional, only for Cover Letter
  joiningDate?: string; // Optional, only for Cover Letter
  yearsOfExperience?: number; // Optional, only for Cover Letter
  company?: string; // Optional, only for Cover Letter
  role?: string; // Optional, only for Cover Letter
  jobDescription?: string; // Optional, only for Cover Letter
  beneficiaryName?: string; // Optional, only for Business Contract
  stakeholderName?: string; // Optional, only for Business Contract
  projectDescription?: string; // Optional, only for Business Contract
  duration?: number; // Optional, only for Business Contract
  title?: string; // Optional, only for IEEE Paper
  abstract?: string; // Optional, only for IEEE Paper
  keywords?: string; // Optional, only for IEEE Paper
}

// Prompt templates for different tools
const promptTemplates: Record<string, (params: GenerationParams) => string> = {
  "Linkedin Post Generation": (params) => `
    Generate a LinkedIn post with the following specifications:
    Topic/Context: ${params.context}
    Writing Style: ${params.style}
    Target Word Count: ${params.wordCount} words

    Make sure the content is engaging, professional, and suitable for LinkedIn's platform.
    The tone should match the requested "${params.style}" style.
    Focus on delivering value and insights related to the given context.
  `,
  "Press Release Generation": (params) => `
    Generate a press release with the following specifications:
    Topic/Context: ${params.context}
    Writing Style: ${params.style}
    Target Word Count: ${params.wordCount} words

    Follow standard press release format including:
    - Compelling headline
    - Location and date
    - Strong lead paragraph
    - Supporting details and quotes
    - Boilerplate company information

    The tone should match the requested "${params.style}" style while maintaining professionalism.
    Focus on newsworthy aspects and key messages from the given context.
  `,
  "Wikipedia Post Generation": (params) => `
    Generate an explanatory Wikipedia article with the following specifications:
    Topic/Context: ${params.context}
    Writing Style: ${params.style}
    Target Word Count: ${params.wordCount} words

    Follow standard article format including:
    - Intriguing starting paragraph
    - Early life
    - Career
    - Notable Achievements
    - Special Incidents
    - Impact
    - References

    The tone should match the requested "${params.style}" style while maintaining professionalism.
    Focus on reference worthy aspects and key messages from the given context.
  `,
  "Marketing Copy Generation": (params) => `
    Generate a compelling marketing copy with the following specifications:

    Topic/Context: ${params.context}
    Writing Style: ${params.style}
    Target Word Count: ${params.wordCount} words

    ### Structure:
    - **Attention-Grabbing Opening:** Hook the audience immediately.
    - **Pain Points & Solution:** Highlight user pain points and position the product/service as the solution.
    - **Key Benefits & Features:** Clearly communicate unique selling points (USPs).
    - **Social Proof & Trust Elements:** (if applicable) Include testimonials, case studies, or data points.
    - **Strong CTA:** Encourage the audience to take the desired action.

    The copy should be clear, concise, and persuasive, aligning with the target audience’s preferences following "${params.style}" style, while driving engagement and conversions.
  `,
  "Cover Letter Generation": (params) => `
    Generate a cover letter with the following specifications:
    Company: ${params.company}
    Role: ${params.role}
    Years of Experience: ${params.yearsOfExperience} years
    Job Description: ${params.jobDescription}
    Writing Style: ${params.style}

    The cover letter should be tailored to the company and role, highlighting relevant skills and experience from the job description.
    It should follow a standard cover letter format:
    - Your Contact Information
    - Date
    - Employer Contact Information
    - Salutation
    - Introduction: Briefly introduce yourself and state the position you're applying for.
    - Body Paragraphs: Highlight your relevant skills, experiences, and achievements that align with the job requirements. Quantify your achievements whenever possible.
    - Closing Paragraph: Reiterate your interest in the position and express your enthusiasm for the opportunity.
    - Closing: Thank the employer for their time and consideration.
    - Signature
  `,
  "Offer Letter Generation": (params) => `
    Generate a professional offer letter with the following details:
    Company: ${params.company}
    Role: ${params.role}
    Salary: ${params.salary} LPA
    Candidate Name: ${params.candidateName}
    Joining Date: ${params.joiningDate}
    Job Description Summary: ${params.jobDescription}
    Writing Style: ${params.style}

    The offer letter should be clear, formal, and concise, including:
    - Date
    - Candidate's full name and address
    - Greeting/Salutation
    - Statement of the job offer including role, salary, and start date
    - Summary of key job responsibilities
    - Terms of employment, including salary, benefits, probation period (if any)
    - Any contingencies or conditions (background check, document verification, etc.)
    - Instructions for acceptance of the offer
    - Closing statement expressing enthusiasm for the candidate joining
    - Signature block for authorized company representative

    Use a respectful and positive tone consistent with the "${params.style}" writing style.
    Ensure the letter is professional, free of jargon, and easy to understand.
  `,

  "Relieving Letter Generation": (params) => `
    Generate a professional relieving letter with the following details:
    Company: ${params.company}
    Employee Name: ${params.candidateName}
    Role: ${params.role}
    Tenure: ${params.yearsOfExperience} years
    Last Working Day: ${params.lastWorkingDay}
    Writing Style: ${params.style}

    The relieving letter should include:
    - Date
    - Employee's full name and designation
    - Statement confirming acceptance of resignation or release from duties
    - Mention of last working day and tenure at the company
    - Confirmation that all responsibilities have been handed over and no dues are pending
    - Expression of best wishes for the employee's future endeavors
    - Formal closing and signature of authorized company representative

    Use a formal, clear, and respectful tone consistent with the "${params.style}" style.
    Ensure the letter is concise, professional, and free of any ambiguous or irrelevant information.
  `,

  "Business Contract Generation": (params) => `
    Generate a business contract with the following specifications:
    Beneficiary Name: ${params.beneficiaryName}
    Stakeholder Name: ${params.stakeholderName}
    Project Description: ${params.projectDescription}
    Duration: ${params.duration} months
    Writing Style: ${params.style}

    The contract should include clauses related to:
    - Scope of work
    - Payment terms
    - Confidentiality
    - Termination conditions
    - Intellectual property rights
    - Dispute resolution

    The language should be clear, concise, and legally sound, suitable for a formal business agreement.
  `,
  "IEEE Paper Generation": (params) => `
  Generate an IEEE research paper with the following specifications:
  Title: ${params.title}
  Abstract: ${params.abstract}
  Keywords: ${params.keywords}
  Context: ${params.context}
  Writing Style: ${params.style}
  Follow the standard IEEE research paper format, including:
  - Abstract
  - Introduction
  - Related Work
  - Methodology
  - Results
  - Conclusion
  - References
  Ensure the paper is well-structured, technically sound, and adheres to IEEE guidelines.
`,
"X Post Generation": (params) => `
    Generate a X Post content:
    Topic/Context: ${params.context}
    Writing Style: ${params.style}
    Target Word Count: ${params.wordCount} words

    Make sure the content is engaging, informative, and suitable for all platform.
    The tone should match the requested "${params.style}" style. Focus on delivering value and insights related to the given context. Do not include any jargons or improper data, out of context information or any other kind of outliers.
  `,

  "Government Tender Generation": (params) => `
    Generate a Government Tender content:
    Topic/Context: ${params.context}
    Writing Style: ${params.style}
    Target Word Count: ${params.wordCount} words

    Make sure the content is engaging, informative, and suitable for all platform.
    The tone should match the requested "${params.style}" style. Focus on delivering value and insights related to the given context. Do not include any jargons or improper data, out of context information or any other kind of outliers.
  `,
"Documentations Generation": (params) => `
    Generate a Documentations content:
    Topic/Context: ${params.context}
    Writing Style: ${params.style}
    Target Word Count: ${params.wordCount} words

    Make sure the content is engaging, informative, and suitable for all platform.
    The tone should match the requested "${params.style}" style. Focus on delivering value and insights related to the given context. Do not include any jargons or improper data, out of context information or any other kind of outliers.
  `,
"Roadmap Generation": (params) => `
    Generate a Roadmap content:
    Topic/Context: ${params.context}
    Writing Style: ${params.style}
    Target Word Count: ${params.wordCount} words

    Make sure the content is engaging, informative, and suitable for all platform.
    The tone should match the requested "${params.style}" style. Focus on delivering value and insights related to the given context. Do not include any jargons or improper data, out of context information or any other kind of outliers. Always make the content as numbered list.
  `,
"Blog Post Generation": (params) => `
    Generate a Blog Post content:
    Topic/Context: ${params.context}
    Writing Style: ${params.style}
    Target Word Count: ${params.wordCount} words

    Make sure the content is engaging, informative, and suitable for all platform.
    The tone should match the requested "${params.style}" style. Focus on delivering value and insights related to the given context. Do not include any jargons or improper data, out of context information or any other kind of outliers.
  `,
"Email Template Generation": (params) => `
  Write an email template based on the following:
  - **Topic/Context**: ${params.context}
  - **Tone/Style**: ${params.style}
  - **Target Length**: Around ${params.wordCount} words

  Requirements:
  - Make it engaging, informative, and platform-agnostic.
  - Match the "${params.style}" tone consistently.
  - Focus on value and clarity—no jargon, irrelevant content, or factual errors.
`,

"Advertisement Copy Generation": (params) => `
  Write an advertisement copy with the following details:
  - **Topic/Context**: ${params.context}
  - **Tone/Style**: ${params.style}
  - **Target Length**: Around ${params.wordCount} words

  Requirements:
  - Make it catchy, informative, and suitable for any platform.
  - Maintain a consistent "${params.style}" tone throughout.
  - Ensure clarity and relevance—avoid jargon, off-topic content, or misleading claims.
`,

"Pitch Deck Generation": (params) => `
  Create content for a pitch deck with the following details:
  - **Topic/Context**: ${params.context}
  - **Tone/Style**: ${params.style}
  - **Target Length**: Around ${params.wordCount} words

  Guidelines:
  - Make it persuasive, informative, and suitable for use across all platforms.
  - Maintain a consistent "${params.style}" tone.
  - Focus on delivering clear value and insights.
  - Avoid jargon, irrelevant information, or unsupported claims.
`,

"Youtube Script Generation": (params) => `
  Write a YouTube video script with the following details:
  - **Topic/Context**: ${params.context}
  - **Tone/Style**: ${params.style}
  - **Target Length**: Around ${params.wordCount} words

  Guidelines:
  - Make it engaging, informative, and suitable for all viewing platforms.
  - Maintain a consistent "${params.style}" tone throughout.
  - Structure it naturally for spoken delivery (intro, main content, outro or CTA).
  - Focus on clarity and audience value—avoid jargon, off-topic content, or misleading statements.
`,

"Interview Questionnaire Generation": (params) => `
  Generate 10 to 15 professional interview questions based on the following:
  - **Topic/Context**: ${params.context}
  - **Tone/Style**: ${params.style}
  - **Target Word Count**: Approximately ${params.wordCount} words in total

  Guidelines:
  - Present questions in a numbered list.
  - Ensure questions are clear, concise, and relevant to the topic.
  - Use a "${params.style}" tone throughout.
  - Avoid jargon, off-topic content, or unnecessary complexity.
  - Questions should be suitable for a professional interview and engaging across platforms.
  - Focus on eliciting valuable insights and meaningful responses.
`,

"Citation Generation": (params) => `
  Generate citation content based on the following:
  - **Topic/Context**: ${params.context}
  - **Tone/Style**: ${params.style}
  - **Target Length**: Around ${params.wordCount} words

  Guidelines:
  - Present the citations in a numbered list format.
  - Ensure the content is accurate, clear, and relevant to the topic.
  - Use a "${params.style}" tone throughout.
  - Make it suitable for use across all platforms.
  - Avoid jargon, unrelated details, or fabricated sources.
  - Focus on delivering well-sourced, valuable references or attributions.
`,

"Property Deed Generation": (params) => `
  Draft a property deed based on the following:
  - **Topic/Context**: ${params.context}
  - **Tone/Style**: ${params.style}
  - **Target Length**: Around ${params.wordCount} words

  Guidelines:
  - Ensure the content is formal, clear, and legally appropriate.
  - Follow the "${params.style}" tone throughout.
  - Avoid jargon, vague language, or out-of-context details.
  - Include essential components typically found in a property deed (e.g., parties involved, property description, terms).
  - Content should be suitable for documentation or reference across digital and physical platforms.
`,

"Case Study Generation": (params) => `
  Create a case study based on the following:
  - **Topic/Context**: ${params.context}
  - **Tone/Style**: ${params.style}
  - **Target Length**: Around ${params.wordCount} words

  Guidelines:
  - Make it engaging, informative, and suitable for all platforms.
  - Maintain a consistent "${params.style}" tone.
  - Focus on delivering clear value, actionable insights, and relevant data.
  - Avoid jargon, irrelevant details, or inaccurate information.
  - Structure the content to include background, challenges, solutions, and outcomes where applicable.
`,
"Terms & Conditions Generation": (params) => `
  Draft Terms & Conditions content with the following details:
  - **Topic/Context**: ${params.context}
  - **Tone/Style**: ${params.style}
  - **Target Length**: Around ${params.wordCount} words

  Guidelines:
  - Ensure the content is clear, formal, and legally appropriate.
  - Maintain a consistent "${params.style}" tone throughout.
  - Focus on delivering accurate, relevant, and comprehensive terms.
  - Avoid jargon, vague language, or out-of-context information.
  - Content should be suitable for use across all digital platforms.
`,


"Privacy Policy Generation": (params) => `
  Draft a Privacy Policy with the following details:
  - **Topic/Context**: ${params.context}
  - **Tone/Style**: ${params.style}
  - **Target Length**: Around ${params.wordCount} words

  Guidelines:
  - Ensure the content is clear, formal, and legally compliant.
  - Maintain a consistent "${params.style}" tone throughout.
  - Focus on providing accurate, relevant, and comprehensive privacy information.
  - Avoid jargon, vague language, or irrelevant details.
  - Content should be suitable for use across all digital platforms.
`,

"Professional Bio Generation": (params) => `
  Write a professional bio with the following details:
  - **Topic/Context**: ${params.context}
  - **Tone/Style**: ${params.style}
  - **Target Length**: Around ${params.wordCount} words

  Guidelines:
  - Make it engaging, informative, and suitable for all platforms.
  - Maintain a consistent "${params.style}" tone.
  - Focus on highlighting key achievements, skills, and relevant experience.
  - Avoid jargon, irrelevant details, or inaccuracies.
`,

};

// Content generation function
export const generateContent = async (params: GenerationParams): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Get the appropriate prompt template or use a default one
    const promptTemplate = promptTemplates[params.toolType] || promptTemplates["Linkedin Post Generation"];
    const prompt = promptTemplate(params);

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }]}],
      generationConfig: {
        temperature: params.temperature,
        maxOutputTokens: 1024,
      },
    });

    const response = result.response;
    return response.text();
  } catch (error) {

    throw new Error('Failed to generate content. Please try again.');
  }
};

// Define initial configurations for different tools
export const defaultConfigs: Record<string, ToolConfig> = {
  "Linkedin Post Generation": {
    wordCount: 300,
    temperature: 1,
    context: "",
    style: "Formal"
  },
  "Press Release Generation": {
    wordCount: 250,
    temperature: 0.7,
    context: "",
    style: "Business"
  },
  "Wikipedia Post Generation": {
    wordCount: 2500,
    temperature: 1,
    context: "",
    style: "Accounting"
  },
  "Marketing Copy Generation": {
    wordCount: 50,
    temperature: 1.2,
    context: "",
    style: "Business"
  },
  "Cover Letter Generation": {
    wordCount: 300,
    temperature: 0.7,
    context: "",
    style: "Formal",
    yearsOfExperience: 1,
    company: "",
    role: "",
    jobDescription: ""
  },

  "Offer Letter Generation": {
  wordCount: 300,
  temperature: 0.7,
  context: "",
  style: "Formal",
  company: "",
  role: "",
  salary: "",           // e.g., "12"
  candidateName: "",
  joiningDate: "",      // e.g., "June 1, 2025"
  jobDescription: ""
},
  "Relieving Letter Generation": {
    wordCount: 300,
    temperature: 0.7,
    context: "",
    style: "Formal",
    yearsOfExperience: 1,
    company: "",
    role: "",
    jobDescription: ""
  },
  "Business Contract Generation": {  // Added default configuration
    wordCount: 750,
    temperature: 0.8,
    context: "",
    style: "Formal",
    beneficiaryName: "",
    stakeholderName: "",
    projectDescription: "",
    duration: 12
  },
  "IEEE Paper Generation": {

    wordCount: 3000,
    temperature: 0.7,
    context: "",
    style: "Technical",
    title: "",
    abstract: "",
    keywords: ""
  },
  "X Post Generation": {
    wordCount: 250,
    temperature: 1.5,
    context: "",
    style: "Accounting"
  },

  "Government Tender Generation": {
  wordCount: 250,
  temperature: 1.5,
  context: "",
  style: "Accounting"
},
"Documentations Generation": {
  wordCount: 250,
  temperature: 1.5,
  context: "",
  style: "Accounting"
},
"Roadmap Generation": {
  wordCount: 250,
  temperature: 1.5,
  context: "",
  style: "Accounting"
},
"Blog Post Generation": {
  wordCount: 250,
  temperature: 1.5,
  context: "",
  style: "Accounting"
},
"Email Template Generation": {
  wordCount: 250,
  temperature: 1.5,
  context: "",
  style: "Accounting"
},
"Advertisement Copy Generation": {
  wordCount: 250,
  temperature: 1.5,
  context: "",
  style: "Accounting"
},
"Pitch Deck Generation": {
  wordCount: 250,
  temperature: 1.5,
  context: "",
  style: "Accounting"
},
"Youtube Script Generation": {
  wordCount: 250,
  temperature: 1.5,
  context: "",
  style: "Accounting"
},
"Interview Questionnaire Generation": {
  wordCount: 250,
  temperature: 1.5,
  context: "",
  style: "Accounting"
},
"Citation Generation": {
  wordCount: 250,
  temperature: 1.5,
  context: "",
  style: "Accounting"
},
"Property Deed Generation": {
  wordCount: 250,
  temperature: 1.5,
  context: "",
  style: "Accounting"
},
"Case Study Generation": {
  wordCount: 250,
  temperature: 1.5,
  context: "",
  style: "Accounting"
},
"Term & Conditions Generation": {
  wordCount: 250,
  temperature: 1.5,
  context: "",
  style: "Accounting"
},
"Privacy Policy Generation": {
  wordCount: 250,
  temperature: 1.5,
  context: "",
  style: "Accounting"
},
"Professional Bio Generation": {
  wordCount: 250,
  temperature: 1.5,
  context: "",
  style: "Accounting"
}

};

// Helper function to get initial config for a given tool
export const getInitialConfig = (toolType: string): ToolConfig => {
  return { ...defaultConfigs[toolType] };
};

const writingStyles = ["Business", "Formal", "Marketing", "Technical", "Accounting"];

// Create individual toolbar components for each tool type
export const LinkedInToolbar: FC<ToolbarProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-6">
      {/* Three-column layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Word Count */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Word Count</label>
          <Slider
            defaultValue={[config.wordCount]}
            max={1000}
            step={50}
            onValueChange={(value) => onConfigChange({ wordCount: value[0] })}
          />
          <p className="text-xs text-white">Target: {config.wordCount} words</p>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Temperature</label>
          <Slider
            defaultValue={[config.temperature]}
            max={2}
            step={0.1}
            onValueChange={(value) => onConfigChange({ temperature: value[0] })}
          />
          <p className="text-xs text-white">Creativity: {config.temperature}</p>
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Writing Style</label>
          <Select onValueChange={(value) => onConfigChange({ style: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a style" defaultValue={config.style} />
            </SelectTrigger>
            <SelectContent>
              {writingStyles.map((style) => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Context */}
      <div>
        <label className="block text-sm font-medium leading-6 text-white">Context</label>
        <Textarea
          placeholder="Enter the context for your LinkedIn post..."
          value={config.context}
          onChange={(e) => onConfigChange({ context: e.target.value })}
        />
      </div>
    </div>
  );
};

export const PressReleaseToolbar: FC<ToolbarProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-6">
      {/* Three-column layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Word Count */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Word Count</label>
          <Slider
            defaultValue={[config.wordCount]}
            max={1000}
            step={50}
            onValueChange={(value) => onConfigChange({ wordCount: value[0] })}
          />
          <p className="text-xs text-white">Target: {config.wordCount} words</p>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Temperature</label>
          <Slider
            defaultValue={[config.temperature]}
            max={2}
            step={0.1}
            onValueChange={(value) => onConfigChange({ temperature: value[0] })}
          />
          <p className="text-xs text-white">Creativity: {config.temperature}</p>
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Writing Style</label>
          <Select onValueChange={(value) => onConfigChange({ style: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a style" defaultValue={config.style} />
            </SelectTrigger>
            <SelectContent>
              {writingStyles.map((style) => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Context */}
      <div>
        <label className="block text-sm font-medium leading-6 text-white">Announcement Details</label>
        <Textarea
          placeholder="Enter the details of the announcement for the press release..."
          value={config.context}
          onChange={(e) => onConfigChange({ context: e.target.value })}
        />
      </div>
    </div>
  );
};

export const WikipediaToolbar: FC<ToolbarProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-6">
      {/* Three-column layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Word Count */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Word Count</label>
          <Slider
            defaultValue={[config.wordCount]}
            max={5000}
            step={100}
            onValueChange={(value) => onConfigChange({ wordCount: value[0] })}
          />
          <p className="text-xs text-white">Target: {config.wordCount} words</p>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Temperature</label>
          <Slider
            defaultValue={[config.temperature]}
            max={2}
            step={0.1}
            onValueChange={(value) => onConfigChange({ temperature: value[0] })}
          />
          <p className="text-xs text-white">Creativity: {config.temperature}</p>
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Writing Style</label>
          <Select onValueChange={(value) => onConfigChange({ style: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a style" defaultValue={config.style} />
            </SelectTrigger>
            <SelectContent>
              {writingStyles.map((style) => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Context */}
      <div>
        <label className="block text-sm font-medium leading-6 text-white">Post Context</label>
        <Textarea
          placeholder="Enter the context for your Wikipedia article..."
          value={config.context}
          onChange={(e) => onConfigChange({ context: e.target.value })}
        />
      </div>
    </div>
  );
};

export const MarketingToolbar: FC<ToolbarProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-6">
      {/* Three-column layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Word Count */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Word Count</label>
          <Slider
            defaultValue={[config.wordCount]}
            max={500}
            step={25}
            onValueChange={(value) => onConfigChange({ wordCount: value[0] })}
          />
          <p className="text-xs text-white">Target: {config.wordCount} words</p>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Temperature</label>
          <Slider
            defaultValue={[config.temperature]}
            max={2}
            step={0.1}
            onValueChange={(value) => onConfigChange({ temperature: value[0] })}
          />
          <p className="text-xs text-white">Creativity: {config.temperature}</p>
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Writing Style</label>
          <Select onValueChange={(value) => onConfigChange({ style: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a style" defaultValue={config.style} />
            </SelectTrigger>
            <SelectContent>
              {writingStyles.map((style) => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Context */}
      <div>
        <label className="block text-sm font-medium leading-6 text-white">Market Information</label>
        <Textarea
          placeholder="Enter the context of the market, industry or sector and target audience with the expected impact..."
          value={config.context}
          onChange={(e) => onConfigChange({ context: e.target.value })}
        />
      </div>
    </div>
  );
};

export const CoverLetterToolbar: FC<ToolbarProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-6">
      {/* Four-column layout */}
      <div className="grid grid-cols-4 gap-4">
        {/* Word Count */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Word Count</label>
          <Slider
            defaultValue={[config.wordCount]}
            max={500}
            step={25}
            onValueChange={(value) => onConfigChange({ wordCount: value[0] })}
          />
          <p className="text-xs text-white">Target: {config.wordCount} words</p>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Temperature</label>
          <Slider
            defaultValue={[config.temperature]}
            max={2}
            step={0.1}
            onValueChange={(value) => onConfigChange({ temperature: value[0] })}
          />
          <p className="text-xs text-white">Creativity: {config.temperature}</p>
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Writing Style</label>
          <Select onValueChange={(value) => onConfigChange({ style: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a style" defaultValue={config.style} />
            </SelectTrigger>
            <SelectContent>
              {writingStyles.map((style) => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Years of Experience */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Years of Experience</label>
          <Input
            type="number"
            value={config.yearsOfExperience}
            onChange={(e) => onConfigChange({ yearsOfExperience: parseInt(e.target.value) })}
            className="shadow-sm bg-gray-700 border border-gray-500 text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Enter years of experience"
          />
        </div>
      </div>

      {/* Three-column layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Company */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Company</label>
          <Input
            type="text"
            value={config.company}
            onChange={(e) => onConfigChange({ company: e.target.value })}
            placeholder="Enter company name"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Role</label>
          <Input
            type="text"
            value={config.role}
            onChange={(e) => onConfigChange({ role: e.target.value })}
            placeholder="Enter role"
          />
        </div>
      </div>

      {/* Job Description */}
      <div>
        <label className="block text-sm font-medium leading-6 text-white">Job Description</label>
        <Textarea
          placeholder="Enter job description..."
          value={config.jobDescription}
          onChange={(e) => onConfigChange({ jobDescription: e.target.value })}
        />
      </div>
    </div>
  );
};

// Business Contract Generation Toolbar
export const BusinessContractToolbar: FC<ToolbarProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-6">
      {/* Four-column layout */}
      <div className="grid grid-cols-4 gap-4">
        {/* Word Count */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Word Count</label>
          <Slider
            defaultValue={[config.wordCount]}
            max={1000}
            step={50}
            onValueChange={(value) => onConfigChange({ wordCount: value[0] })}
          />
          <p className="text-xs text-white">Target: {config.wordCount} words</p>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Temperature</label>
          <Slider
            defaultValue={[config.temperature]}
            max={2}
            step={0.1}
            onValueChange={(value) => onConfigChange({ temperature: value[0] })}
          />
          <p className="text-xs text-white">Creativity: {config.temperature}</p>
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Writing Style</label>
          <Select onValueChange={(value) => onConfigChange({ style: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a style" defaultValue={config.style} />
            </SelectTrigger>
            <SelectContent>
              {writingStyles.map((style) => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Duration (Months)</label>
          <Input
            type="number"
            value={config.duration}
            onChange={(e) => onConfigChange({ duration: parseInt(e.target.value) })}
            className="shadow-sm bg-gray-700 border border-gray-500 text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Enter duration in months"
          />
        </div>
      </div>

      {/* Three-column layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Beneficiary Name */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Beneficiary Name</label>
          <Input
            type="text"
            value={config.beneficiaryName}
            onChange={(e) => onConfigChange({ beneficiaryName: e.target.value })}
            placeholder="Enter beneficiary name"
          />
        </div>

        {/* Stakeholder Name */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Stakeholder Name</label>
          <Input
            type="text"
            value={config.stakeholderName}
            onChange={(e) => onConfigChange({ stakeholderName: e.target.value })}
            placeholder="Enter stakeholder name"
          />
        </div>

        {/* Project Description */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Project Description</label>
          <Textarea
            placeholder="Enter project description..."
            value={config.projectDescription}
            onChange={(e) => onConfigChange({ projectDescription: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};

// IEEE Paper Generation Toolbar

export const IEEEToolbar: FC<ToolbarProps> = ({ config, onConfigChange }) => {

  return (

      <div className="space-y-6">

          {/* Two-column layout */}

          <div className="grid grid-cols-2 gap-4">

              {/* Title */}

              <div>

                  <label className="block text-sm font-medium leading-6 text-white">Title</label>

                  <Input

                      type="text"

                      value={config.title}

                      onChange={(e) => onConfigChange({ title: e.target.value })}

                      placeholder="Enter paper title"

                  />

              </div>



              {/* Keywords */}

              <div>

                  <label className="block text-sm font-medium leading-6 text-white">Keywords (comma-separated)</label>

                  <Input

                      type="text"

                      value={config.keywords}

                      onChange={(e) => onConfigChange({ keywords: e.target.value })}

                      placeholder="Enter keywords"

                  />

              </div>

          </div>



          {/* Abstract */}

          <div>

              <label className="block text-sm font-medium leading-6 text-white">Abstract</label>

              <Textarea

                  placeholder="Enter abstract..."

                  value={config.abstract}

                  onChange={(e) => onConfigChange({ abstract: e.target.value })}

              />

          </div>



          {/* Context */}

          <div>

              <label className="block text-sm font-medium leading-6 text-white">Context</label>

              <Textarea

                  placeholder="Enter the context for your IEEE paper..."

                  value={config.context}

                  onChange={(e) => onConfigChange({ context: e.target.value })}

              />

          </div>

      </div>

  );
};

export const XPostToolbar: FC<ToolbarProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-6">
      {/* Three-column layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Word Count */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Word Count</label>
          <Slider
            defaultValue={[config.wordCount]}
            max={1000}
            step={50}
            onValueChange={(value) => onConfigChange({ wordCount: value[0] })}
          />
          <p className="text-xs text-white">Target: {config.wordCount} words</p>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Temperature</label>
          <Slider
            defaultValue={[config.temperature]}
            max={2}
            step={0.1}
            onValueChange={(value) => onConfigChange({ temperature: value[0] })}
          />
          <p className="text-xs text-white">Creativity: {config.temperature}</p>
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Writing Style</label>
          <Select onValueChange={(value) => onConfigChange({ style: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a style" defaultValue={config.style} />
            </SelectTrigger>
            <SelectContent>
              {writingStyles.map((style) => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Context */}
      <div>
        <label className="block text-sm font-medium leading-6 text-white">Context</label>
        <Textarea
          placeholder="Enter the context for your LinkedIn post..."
          value={config.context}
          onChange={(e) => onConfigChange({ context: e.target.value })}
        />
      </div>
    </div>
  );
};

export const GovernmentTenderToolbar: FC<ToolbarProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-6">
      {/* Three-column layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Word Count */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Word Count</label>
          <Slider
            defaultValue={[config.wordCount]}
            max={1000}
            step={50}
            onValueChange={(value) => onConfigChange({ wordCount: value[0] })}
          />
          <p className="text-xs text-white">Target: {config.wordCount} words</p>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Temperature</label>
          <Slider
            defaultValue={[config.temperature]}
            max={2}
            step={0.1}
            onValueChange={(value) => onConfigChange({ temperature: value[0] })}
          />
          <p className="text-xs text-white">Creativity: {config.temperature}</p>
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Writing Style</label>
          <Select onValueChange={(value) => onConfigChange({ style: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a style" defaultValue={config.style} />
            </SelectTrigger>
            <SelectContent>
              {writingStyles.map((style) => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Context */}
      <div>
        <label className="block text-sm font-medium leading-6 text-white">Context</label>
        <Textarea
          placeholder="Enter the context for your Government Tender / Government Order..."
          value={config.context}
          onChange={(e) => onConfigChange({ context: e.target.value })}
        />
      </div>
    </div>
  );
};

export const DocumentationToolbar: FC<ToolbarProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-6">
      {/* Three-column layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Word Count */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Word Count</label>
          <Slider
            defaultValue={[config.wordCount]}
            max={1000}
            step={50}
            onValueChange={(value) => onConfigChange({ wordCount: value[0] })}
          />
          <p className="text-xs text-white">Target: {config.wordCount} words</p>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Temperature</label>
          <Slider
            defaultValue={[config.temperature]}
            max={2}
            step={0.1}
            onValueChange={(value) => onConfigChange({ temperature: value[0] })}
          />
          <p className="text-xs text-white">Creativity: {config.temperature}</p>
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Writing Style</label>
          <Select onValueChange={(value) => onConfigChange({ style: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a style" defaultValue={config.style} />
            </SelectTrigger>
            <SelectContent>
              {writingStyles.map((style) => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Context */}
      <div>
        <label className="block text-sm font-medium leading-6 text-white">Context</label>
        <Textarea
          placeholder="Enter the context for your Documentation Generation..."
          value={config.context}
          onChange={(e) => onConfigChange({ context: e.target.value })}
        />
      </div>
    </div>
  );
};

export const OfferLetterToolbar: FC<ToolbarProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-6">
      {/* Four-column layout */}
      <div className="grid grid-cols-4 gap-4">
        {/* Word Count */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Word Count</label>
          <Slider
            defaultValue={[config.wordCount]}
            max={500}
            step={25}
            onValueChange={(value) => onConfigChange({ wordCount: value[0] })}
          />
          <p className="text-xs text-white">Target: {config.wordCount} words</p>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Temperature</label>
          <Slider
            defaultValue={[config.temperature]}
            max={2}
            step={0.1}
            onValueChange={(value) => onConfigChange({ temperature: value[0] })}
          />
          <p className="text-xs text-white">Creativity: {config.temperature}</p>
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Writing Style</label>
          <Select onValueChange={(value) => onConfigChange({ style: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a style" defaultValue={config.style} />
            </SelectTrigger>
            <SelectContent>
              {writingStyles.map((style) => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Years of Experience */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Salary</label>
          <Input
            type="number"
            value={config.yearsOfExperience}
            onChange={(e) => onConfigChange({ yearsOfExperience: parseInt(e.target.value) })}
            className="shadow-sm bg-gray-700 border border-gray-500 text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Enter the salary package"
          />
        </div>
      </div>

      {/* Three-column layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Company */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Company</label>
          <Input
            type="text"
            value={config.company}
            onChange={(e) => onConfigChange({ company: e.target.value })}
            placeholder="Enter company name"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Role</label>
          <Input
            type="text"
            value={config.role}
            onChange={(e) => onConfigChange({ role: e.target.value })}
            placeholder="Enter role"
          />
        </div>
      </div>

      {/* Job Description */}
      <div>
        <label className="block text-sm font-medium leading-6 text-white">Job Description</label>
        <Textarea
          placeholder="Enter job description..."
          value={config.jobDescription}
          onChange={(e) => onConfigChange({ jobDescription: e.target.value })}
        />
      </div>
    </div>
  );
};

export const RelievingLetterToolbar: FC<ToolbarProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-6">
      {/* Four-column layout */}
      <div className="grid grid-cols-4 gap-4">
        {/* Word Count */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Word Count</label>
          <Slider
            defaultValue={[config.wordCount]}
            max={500}
            step={25}
            onValueChange={(value) => onConfigChange({ wordCount: value[0] })}
          />
          <p className="text-xs text-white">Target: {config.wordCount} words</p>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Temperature</label>
          <Slider
            defaultValue={[config.temperature]}
            max={2}
            step={0.1}
            onValueChange={(value) => onConfigChange({ temperature: value[0] })}
          />
          <p className="text-xs text-white">Creativity: {config.temperature}</p>
        </div>

        {/* Writing Style */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Writing Style</label>
          <Select onValueChange={(value) => onConfigChange({ style: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a style" defaultValue={config.style} />
            </SelectTrigger>
            <SelectContent>
              {writingStyles.map((style) => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tenure */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Tenure (Years)</label>
          <Input
            type="number"
            value={config.yearsOfExperience}
            onChange={(e) => onConfigChange({ yearsOfExperience: parseInt(e.target.value) })}
            className="shadow-sm bg-gray-700 border border-gray-500 text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Enter years of service"
          />
        </div>
      </div>

      {/* Three-column layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Company */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Company</label>
          <Input
            type="text"
            value={config.company}
            onChange={(e) => onConfigChange({ company: e.target.value })}
            placeholder="Enter company name"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Role</label>
          <Input
            type="text"
            value={config.role}
            onChange={(e) => onConfigChange({ role: e.target.value })}
            placeholder="Enter role"
          />
        </div>

        {/* Candidate Name */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Employee Name</label>
          <Input
            type="text"
            value={config.candidateName}
            onChange={(e) => onConfigChange({ candidateName: e.target.value })}
            placeholder="Enter employee full name"
          />
        </div>
      </div>

      {/* Last Working Day */}
      <div>
        <label className="block text-sm font-medium leading-6 text-white">Last Working Day</label>
        <Input
          type="date"
          value={config.lastWorkingDay}
          onChange={(e) => onConfigChange({ lastWorkingDay: e.target.value })}
          className="bg-gray-700 text-white border border-gray-500 rounded-lg p-2.5"
        />
      </div>

      {/* Job Description */}
      <div>
        <label className="block text-sm font-medium leading-6 text-white">Job Description</label>
        <Textarea
          placeholder="Enter job description..."
          value={config.jobDescription}
          onChange={(e) => onConfigChange({ jobDescription: e.target.value })}
        />
      </div>
    </div>
  );
};

export const RoadmapToolbar: FC<ToolbarProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-6">
      {/* Three-column layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Word Count */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Word Count</label>
          <Slider
            defaultValue={[config.wordCount]}
            max={1000}
            step={50}
            onValueChange={(value) => onConfigChange({ wordCount: value[0] })}
          />
          <p className="text-xs text-white">Target: {config.wordCount} words</p>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Temperature</label>
          <Slider
            defaultValue={[config.temperature]}
            max={2}
            step={0.1}
            onValueChange={(value) => onConfigChange({ temperature: value[0] })}
          />
          <p className="text-xs text-white">Creativity: {config.temperature}</p>
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Writing Style</label>
          <Select onValueChange={(value) => onConfigChange({ style: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a style" defaultValue={config.style} />
            </SelectTrigger>
            <SelectContent>
              {writingStyles.map((style) => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Context */}
      <div>
        <label className="block text-sm font-medium leading-6 text-white">Context</label>
        <Textarea
          placeholder="Enter the context for your Roadmap..."
          value={config.context}
          onChange={(e) => onConfigChange({ context: e.target.value })}
        />
      </div>
    </div>
  );
};

export const BlogPostToolbar: FC<ToolbarProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-6">
      {/* Three-column layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Word Count */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Word Count</label>
          <Slider
            defaultValue={[config.wordCount]}
            max={1000}
            step={50}
            onValueChange={(value) => onConfigChange({ wordCount: value[0] })}
          />
          <p className="text-xs text-white">Target: {config.wordCount} words</p>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Temperature</label>
          <Slider
            defaultValue={[config.temperature]}
            max={2}
            step={0.1}
            onValueChange={(value) => onConfigChange({ temperature: value[0] })}
          />
          <p className="text-xs text-white">Creativity: {config.temperature}</p>
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Writing Style</label>
          <Select onValueChange={(value) => onConfigChange({ style: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a style" defaultValue={config.style} />
            </SelectTrigger>
            <SelectContent>
              {writingStyles.map((style) => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Context */}
      <div>
        <label className="block text-sm font-medium leading-6 text-white">Context</label>
        <Textarea
          placeholder="Enter the context for your Blog post..."
          value={config.context}
          onChange={(e) => onConfigChange({ context: e.target.value })}
        />
      </div>
    </div>
  );
};

export const EmailTemplateToolbar: FC<ToolbarProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-6">
      {/* Three-column layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Word Count */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Word Count</label>
          <Slider
            defaultValue={[config.wordCount]}
            max={1000}
            step={50}
            onValueChange={(value) => onConfigChange({ wordCount: value[0] })}
          />
          <p className="text-xs text-white">Target: {config.wordCount} words</p>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Temperature</label>
          <Slider
            defaultValue={[config.temperature]}
            max={2}
            step={0.1}
            onValueChange={(value) => onConfigChange({ temperature: value[0] })}
          />
          <p className="text-xs text-white">Creativity: {config.temperature}</p>
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Writing Style</label>
          <Select onValueChange={(value) => onConfigChange({ style: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a style" defaultValue={config.style} />
            </SelectTrigger>
            <SelectContent>
              {writingStyles.map((style) => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Context */}
      <div>
        <label className="block text-sm font-medium leading-6 text-white">Context</label>
        <Textarea
          placeholder="Enter the context for your Email template..."
          value={config.context}
          onChange={(e) => onConfigChange({ context: e.target.value })}
        />
      </div>
    </div>
  );
};

export const AdvertisementCopyToolbar: FC<ToolbarProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-6">
      {/* Three-column layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Word Count */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Word Count</label>
          <Slider
            defaultValue={[config.wordCount]}
            max={1000}
            step={50}
            onValueChange={(value) => onConfigChange({ wordCount: value[0] })}
          />
          <p className="text-xs text-white">Target: {config.wordCount} words</p>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Temperature</label>
          <Slider
            defaultValue={[config.temperature]}
            max={2}
            step={0.1}
            onValueChange={(value) => onConfigChange({ temperature: value[0] })}
          />
          <p className="text-xs text-white">Creativity: {config.temperature}</p>
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Writing Style</label>
          <Select onValueChange={(value) => onConfigChange({ style: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a style" defaultValue={config.style} />
            </SelectTrigger>
            <SelectContent>
              {writingStyles.map((style) => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Context */}
      <div>
        <label className="block text-sm font-medium leading-6 text-white">Context</label>
        <Textarea
          placeholder="Enter the context for your Advertisement Copy..."
          value={config.context}
          onChange={(e) => onConfigChange({ context: e.target.value })}
        />
      </div>
    </div>
  );
};

export const PitchDeckToolbar: FC<ToolbarProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-6">
      {/* Three-column layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Word Count */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Word Count</label>
          <Slider
            defaultValue={[config.wordCount]}
            max={1000}
            step={50}
            onValueChange={(value) => onConfigChange({ wordCount: value[0] })}
          />
          <p className="text-xs text-white">Target: {config.wordCount} words</p>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Temperature</label>
          <Slider
            defaultValue={[config.temperature]}
            max={2}
            step={0.1}
            onValueChange={(value) => onConfigChange({ temperature: value[0] })}
          />
          <p className="text-xs text-white">Creativity: {config.temperature}</p>
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Writing Style</label>
          <Select onValueChange={(value) => onConfigChange({ style: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a style" defaultValue={config.style} />
            </SelectTrigger>
            <SelectContent>
              {writingStyles.map((style) => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Context */}
      <div>
        <label className="block text-sm font-medium leading-6 text-white">Context</label>
        <Textarea
          placeholder="Enter the context for your Pitch Deck..."
          value={config.context}
          onChange={(e) => onConfigChange({ context: e.target.value })}
        />
      </div>
    </div>
  );
};

export const YoutubeScriptToolbar: FC<ToolbarProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-6">
      {/* Three-column layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Word Count */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Word Count</label>
          <Slider
            defaultValue={[config.wordCount]}
            max={1000}
            step={50}
            onValueChange={(value) => onConfigChange({ wordCount: value[0] })}
          />
          <p className="text-xs text-white">Target: {config.wordCount} words</p>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Temperature</label>
          <Slider
            defaultValue={[config.temperature]}
            max={2}
            step={0.1}
            onValueChange={(value) => onConfigChange({ temperature: value[0] })}
          />
          <p className="text-xs text-white">Creativity: {config.temperature}</p>
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Writing Style</label>
          <Select onValueChange={(value) => onConfigChange({ style: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a style" defaultValue={config.style} />
            </SelectTrigger>
            <SelectContent>
              {writingStyles.map((style) => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Context */}
      <div>
        <label className="block text-sm font-medium leading-6 text-white">Context</label>
        <Textarea
          placeholder="Enter the context for your Youtube Script..."
          value={config.context}
          onChange={(e) => onConfigChange({ context: e.target.value })}
        />
      </div>
    </div>
  );
};

export const InterviewQuestionnaireToolbar: FC<ToolbarProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-6">
      {/* Three-column layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Word Count */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Word Count</label>
          <Slider
            defaultValue={[config.wordCount]}
            max={1000}
            step={50}
            onValueChange={(value) => onConfigChange({ wordCount: value[0] })}
          />
          <p className="text-xs text-white">Target: {config.wordCount} words</p>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Temperature</label>
          <Slider
            defaultValue={[config.temperature]}
            max={2}
            step={0.1}
            onValueChange={(value) => onConfigChange({ temperature: value[0] })}
          />
          <p className="text-xs text-white">Creativity: {config.temperature}</p>
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Writing Style</label>
          <Select onValueChange={(value) => onConfigChange({ style: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a style" defaultValue={config.style} />
            </SelectTrigger>
            <SelectContent>
              {writingStyles.map((style) => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Context */}
      <div>
        <label className="block text-sm font-medium leading-6 text-white">Context</label>
        <Textarea
          placeholder="Enter the context for your Interview Questionnaire..."
          value={config.context}
          onChange={(e) => onConfigChange({ context: e.target.value })}
        />
      </div>
    </div>
  );
};

export const CitationToolbar: FC<ToolbarProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-6">
      {/* Three-column layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Word Count */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Word Count</label>
          <Slider
            defaultValue={[config.wordCount]}
            max={1000}
            step={50}
            onValueChange={(value) => onConfigChange({ wordCount: value[0] })}
          />
          <p className="text-xs text-white">Target: {config.wordCount} words</p>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Temperature</label>
          <Slider
            defaultValue={[config.temperature]}
            max={2}
            step={0.1}
            onValueChange={(value) => onConfigChange({ temperature: value[0] })}
          />
          <p className="text-xs text-white">Creativity: {config.temperature}</p>
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Writing Style</label>
          <Select onValueChange={(value) => onConfigChange({ style: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a style" defaultValue={config.style} />
            </SelectTrigger>
            <SelectContent>
              {writingStyles.map((style) => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Context */}
      <div>
        <label className="block text-sm font-medium leading-6 text-white">Context</label>
        <Textarea
          placeholder="Enter the context for your Citation..."
          value={config.context}
          onChange={(e) => onConfigChange({ context: e.target.value })}
        />
      </div>
    </div>
  );
};

export const PropertyDeedToolbar: FC<ToolbarProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-6">
      {/* Three-column layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Word Count */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Word Count</label>
          <Slider
            defaultValue={[config.wordCount]}
            max={1000}
            step={50}
            onValueChange={(value) => onConfigChange({ wordCount: value[0] })}
          />
          <p className="text-xs text-white">Target: {config.wordCount} words</p>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Temperature</label>
          <Slider
            defaultValue={[config.temperature]}
            max={2}
            step={0.1}
            onValueChange={(value) => onConfigChange({ temperature: value[0] })}
          />
          <p className="text-xs text-white">Creativity: {config.temperature}</p>
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Writing Style</label>
          <Select onValueChange={(value) => onConfigChange({ style: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a style" defaultValue={config.style} />
            </SelectTrigger>
            <SelectContent>
              {writingStyles.map((style) => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Context */}
      <div>
        <label className="block text-sm font-medium leading-6 text-white">Context</label>
        <Textarea
          placeholder="Enter the context for your Property Deed post..."
          value={config.context}
          onChange={(e) => onConfigChange({ context: e.target.value })}
        />
      </div>
    </div>
  );
};

export const CaseStudyToolbar: FC<ToolbarProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-6">
      {/* Three-column layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Word Count */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Word Count</label>
          <Slider
            defaultValue={[config.wordCount]}
            max={1000}
            step={50}
            onValueChange={(value) => onConfigChange({ wordCount: value[0] })}
          />
          <p className="text-xs text-white">Target: {config.wordCount} words</p>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Temperature</label>
          <Slider
            defaultValue={[config.temperature]}
            max={2}
            step={0.1}
            onValueChange={(value) => onConfigChange({ temperature: value[0] })}
          />
          <p className="text-xs text-white">Creativity: {config.temperature}</p>
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Writing Style</label>
          <Select onValueChange={(value) => onConfigChange({ style: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a style" defaultValue={config.style} />
            </SelectTrigger>
            <SelectContent>
              {writingStyles.map((style) => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Context */}
      <div>
        <label className="block text-sm font-medium leading-6 text-white">Context</label>
        <Textarea
          placeholder="Enter the context for your Case Study..."
          value={config.context}
          onChange={(e) => onConfigChange({ context: e.target.value })}
        />
      </div>
    </div>
  );
};

export const TermsConditionsToolbar: FC<ToolbarProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-6">
      {/* Three-column layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Word Count */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Word Count</label>
          <Slider
            defaultValue={[config.wordCount]}
            max={1000}
            step={50}
            onValueChange={(value) => onConfigChange({ wordCount: value[0] })}
          />
          <p className="text-xs text-white">Target: {config.wordCount} words</p>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Temperature</label>
          <Slider
            defaultValue={[config.temperature]}
            max={2}
            step={0.1}
            onValueChange={(value) => onConfigChange({ temperature: value[0] })}
          />
          <p className="text-xs text-white">Creativity: {config.temperature}</p>
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Writing Style</label>
          <Select onValueChange={(value) => onConfigChange({ style: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a style" defaultValue={config.style} />
            </SelectTrigger>
            <SelectContent>
              {writingStyles.map((style) => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Context */}
      <div>
        <label className="block text-sm font-medium leading-6 text-white">Context</label>
        <Textarea
          placeholder="Enter the context for your Terms & Conditions..."
          value={config.context}
          onChange={(e) => onConfigChange({ context: e.target.value })}
        />
      </div>
    </div>
  );
};

export const PrivacyPolicyToolbar: FC<ToolbarProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-6">
      {/* Three-column layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Word Count */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Word Count</label>
          <Slider
            defaultValue={[config.wordCount]}
            max={1000}
            step={50}
            onValueChange={(value) => onConfigChange({ wordCount: value[0] })}
          />
          <p className="text-xs text-white">Target: {config.wordCount} words</p>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Temperature</label>
          <Slider
            defaultValue={[config.temperature]}
            max={2}
            step={0.1}
            onValueChange={(value) => onConfigChange({ temperature: value[0] })}
          />
          <p className="text-xs text-white">Creativity: {config.temperature}</p>
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Writing Style</label>
          <Select onValueChange={(value) => onConfigChange({ style: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a style" defaultValue={config.style} />
            </SelectTrigger>
            <SelectContent>
              {writingStyles.map((style) => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Context */}
      <div>
        <label className="block text-sm font-medium leading-6 text-white">Context</label>
        <Textarea
          placeholder="Enter the context for your Privacy Policy..."
          value={config.context}
          onChange={(e) => onConfigChange({ context: e.target.value })}
        />
      </div>
    </div>
  );
};

export const ProfessionalBioToolbar: FC<ToolbarProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-6">
      {/* Three-column layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Word Count */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Word Count</label>
          <Slider
            defaultValue={[config.wordCount]}
            max={1000}
            step={50}
            onValueChange={(value) => onConfigChange({ wordCount: value[0] })}
          />
          <p className="text-xs text-white">Target: {config.wordCount} words</p>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Temperature</label>
          <Slider
            defaultValue={[config.temperature]}
            max={2}
            step={0.1}
            onValueChange={(value) => onConfigChange({ temperature: value[0] })}
          />
          <p className="text-xs text-white">Creativity: {config.temperature}</p>
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium leading-6 text-white">Writing Style</label>
          <Select onValueChange={(value) => onConfigChange({ style: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a style" defaultValue={config.style} />
            </SelectTrigger>
            <SelectContent>
              {writingStyles.map((style) => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Context */}
      <div>
        <label className="block text-sm font-medium leading-6 text-white">Context</label>
        <Textarea
          placeholder="Enter the context for your Professinal Bio..."
          value={config.context}
          onChange={(e) => onConfigChange({ context: e.target.value })}
        />
      </div>
    </div>
  );
};
// Map each content type to its toolbar component
export const toolbarConfig: Record<string, FC<ToolbarProps>> = {
  "Linkedin Post Generation": LinkedInToolbar,
  "Press Release Generation": PressReleaseToolbar,
  "Wikipedia Post Generation": WikipediaToolbar,
  "Marketing Copy Generation": MarketingToolbar,
  "Cover Letter Generation": CoverLetterToolbar,
  "Business Contract Generation": BusinessContractToolbar,  
  "IEEE Paper Generation": IEEEToolbar,
  "X Post Generation":XPostToolbar,
  "Government Tender Generation":GovernmentTenderToolbar,
  "Documentations Generation": DocumentationToolbar,
  "Offer Letter Generation": OfferLetterToolbar,
  "Relieving Letter Generation": RelievingLetterToolbar,
  "Roadmap Generation": RoadmapToolbar,
  "Blog Post Generation": BlogPostToolbar,
  "Email Template Generation": EmailTemplateToolbar,
  "Advertisement Copy Generation": AdvertisementCopyToolbar,
  "Pitch Deck Generation": PitchDeckToolbar,
  "Youtube Script Generation": YoutubeScriptToolbar,
  "Interview Questionnaire Generation": InterviewQuestionnaireToolbar,
  "Citation Generation": CitationToolbar,
  "Property Deed Generation": PropertyDeedToolbar,
  "Case Study Generation": CaseStudyToolbar,
  "Term & Conditions Generation": TermsConditionsToolbar,
  "Privacy Policy Generation": PrivacyPolicyToolbar,
  "Professional Bio Generation": ProfessionalBioToolbar,
  
};
  

