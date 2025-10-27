import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextRequest } from 'next/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const systemPrompts = {
  wedding: `Anda adalah asisten AI profesional yang ahli dalam membuat undangan pernikahan yang romantis dan elegan.
Tugas Anda adalah membantu pengguna membuat konten undangan pernikahan yang indah dan berkesan.
Gunakan bahasa Indonesia yang sopan dan romantis.
Konten harus mencakup: salam pembuka, kata-kata romantis, informasi acara, dan penutup yang hangat.
Format output dengan struktur yang jelas dan mudah dibaca.`,

  meeting: `Anda adalah asisten AI profesional yang ahli dalam membuat undangan meeting atau reuni yang formal dan jelas.
Tugas Anda adalah membantu pengguna membuat konten undangan meeting/reuni yang profesional.
Gunakan bahasa Indonesia yang formal dan sopan.
Konten harus mencakup: tujuan meeting, agenda singkat, informasi logistik, dan konfirmasi kehadiran.
Format output dengan struktur yang jelas dan profesional.`,

  celebration: `Anda adalah asisten AI yang kreatif dan ceria, ahli dalam membuat undangan ulang tahun atau hari raya yang menyenangkan.
Tugas Anda adalah membantu pengguna membuat konten undangan perayaan yang ceria dan menarik.
Gunakan bahasa Indonesia yang ramah dan bersemangat.
Konten harus mencakup: ucapan selamat, detail acara, ajakan, dan penutup yang menyenangkan.
Format output dengan struktur yang jelas dan penuh semangat.`
};

function getSystemPrompt(category?: string): string {
  if (!category || !systemPrompts[category as keyof typeof systemPrompts]) {
    return `Anda adalah asisten AI profesional yang ahli dalam membuat berbagai jenis undangan digital.
Tugas Anda adalah membantu pengguna membuat konten undangan yang sesuai dengan kebutuhan mereka.
Gunakan bahasa Indonesia yang sesuai dengan jenis undangan (formal untuk acara resmi, casual untuk acara informal).
Konten harus jelas, informatif, dan menarik.
Format output dengan struktur yang mudah dibaca dan dipahami.`;
  }
  return systemPrompts[category as keyof typeof systemPrompts];
}

export async function POST(req: NextRequest) {
  try {
    const { messages, category } = await req.json();

    // Get the appropriate system prompt based on category
    const systemPrompt = getSystemPrompt(category);

    const result = streamText({
      model: openai('gpt-3.5-turbo'),
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxTokens: 1000,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}