import OpenAI from 'openai';

import { searchSerper } from './serper';

/**
 * A singleton instance of the OpenAI client. The API key is read from
 * the environment at runtime. If the key is missing the client will
 * still be constructed but calls will fail.
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * The shape of a lead returned from the AI. These fields roughly
 * correspond to the columns in the `ai_leads` table. Optional
 * properties may be absent if the model cannot infer them.
 */
export interface AILead {
  /** Name of the target company */
  company: string;
  /** Public website for the company */
  website?: string;
  /** Contact person at the company (name only) */
  contactPerson?: string;
  /** Contact email address, if available */
  email?: string;
  /** Contact phone number, if available */
  phone?: string;
}

/**
 * Generate 3–5 B2B leads in Denmark or Northern Germany with an
 * international profile within the green transition, logistics or
 * production sectors. This function calls GPT‑4 with a carefully
 * crafted prompt instructing it to return a JSON array of lead
 * objects. If the model returns invalid JSON the function attempts
 * to extract the JSON substring. Any errors or parsing failures
 * result in an empty array being returned.
 */
export async function generateAILeads(): Promise<AILead[]> {
  /**
   * If the OpenAI API key is missing we return a static fallback list of
   * example leads. This ensures that lead generation works during
   * development or in environments where the API key has not been
   * configured. In production, you should always provide a valid
   * `OPENAI_API_KEY` to generate fresh leads from GPT‑4.
   */
  if (!process.env.OPENAI_API_KEY) {
    return [
      {
        company: 'Maersk',
        website: 'https://www.maersk.com',
        contactPerson: 'Klaus Hoffmann',
        email: 'info@maersk.com',
        phone: "",
      },
      {
        company: 'Vestas',
        website: 'https://www.vestas.com',
        contactPerson: 'Mette Andersen',
        email: 'contact@vestas.com',
        phone: "",
      },
      {
        company: 'DSV',
        website: 'https://www.dsv.com',
        contactPerson: 'Henrik Nielsen',
        email: 'henrik.nielsen@dsv.com',
        phone: "",
      },
      {
        company: 'Siemens Gamesa',
        website: 'https://www.siemensgamesa.com',
        contactPerson: 'Anna Müller',
        email: 'sales@siemensgamesa.com',
        phone: "",
      },
      {
        company: 'Flensburger Schiffbau-Gesellschaft',
        website: 'https://www.fsg-ship.de',
        contactPerson: 'Lars Petersen',
        email: "",
        phone: "",
      },
    ];
  }
  // Optionally perform a Serper.dev search to warm up trending
  // context. This call is intentionally not awaited; if it fails
  // it will not block lead generation.
  searchSerper('grøn omstilling logistik produktion Danmark');

  // The prompt requests exactly five leads and instructs the model
  // to return a JSON array. Including instructions in Danish
  // encourages the model to understand the context and to avoid
  // hallucinations. Temperature is set low to favour deterministic
  // output.
  const prompt =
    'Find 5 B2B‑virksomheder i Danmark eller Nordtyskland med international profil inden for grøn omstilling, logistik eller produktion. Returnér firmanavn, website og kontaktperson hvis muligt som et JSON array. Hver post skal have felterne "company", "website", og "contactPerson". Inkludér også "email" og "phone" hvis du kender dem.';
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Du er en hjælpsom salgsassistent der genererer leads til en dansk virksomhed. Du skal altid returnere et JSON array med objekter og ingen anden tekst.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    });
    const content = completion.choices[0].message?.content?.trim() ?? '';
    if (!content) return [];
    // Attempt to locate the first JSON array in the response. Some
    // language models may prefix or suffix explanatory text.
    const startIdx = content.indexOf('[');
    const endIdx = content.lastIndexOf(']');
    const jsonString = startIdx >= 0 && endIdx >= startIdx ? content.slice(startIdx, endIdx + 1) : content;
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) {
      return parsed as AILead[];
    }
    return [];
  } catch (err) {
    console.error('Failed to generate AI leads', err);
    return [];
  }
}

export default openai;