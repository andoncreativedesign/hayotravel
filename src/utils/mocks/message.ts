import { UIMessage } from "ai";
import { mockFlightOffers } from "./flights";
import { mockHotelOptions } from "./hotels";

export const messagesMock = [
  {
    id: "30090dfb-b9f4-47fd-a91d-8d5effd6e5b9",
    role: "user",
    content:
      "flights from dxb to lisbon in business class depart 22 july back on 27th bulky. 1 night hotel in lisbon on 22 july 4 star and 3 nights in albufeira 5 star. Traveling alone, limited budget.",
    createdAt: new Date("2025-06-26T14:56:56+03:00"),
    experimental_attachments: undefined,
    parts: [
      {
        type: "text",
        text: "flights from dxb to lisbon in business class depart 22 july back on 27th bulky. 1 night hotel in lisbon on 22 july 4 star and 3 nights in albufeira 5 star. Traveling alone, limited budget.",
      },
    ],
  },
  {
    id: "616a1e6f-9c8f-4c25-921d-6c1dfb9baf82",
    role: "assistant",
    parts: [
      { type: "step-start" },
      {
        type: "text",
        text: `# Trip Summary: Lisbon & Albufeira – 22 July to 27 July
## Quick Overview
- **Destination**: Lisbon (1 night), then Albufeira (3 nights), Portugal
- **Dates**: 22 July to 27 July (5 nights total)
- **Travelers**: 1 adult
- **Estimated Total Cost**: $3,200 – $5,400 per person (business class flights + 4-star/5-star hotels)`,
      },
      {
        type: "tool-invocation",
        toolInvocation: {
          state: "result",
          toolName: "flight_options",
          toolCallId: "123",
          result: {
            options: mockFlightOffers,
          },
        },
      },
      {
        type: "text",
        text: `## Accommodation Options
You’ve requested:
• 1 night (22 July) in Lisbon, 4-star
• 3 nights (23 July to 26 July) in Albufeira, 5-star

Below are potential matches for each location:`,
      },
      {
        type: "tool-invocation",
        toolInvocation: {
          state: "result",
          toolName: "hotel_options",
          toolCallId: "321",
          result: {
            options: mockHotelOptions,
          },
        },
      },
      {
        type: "text",
        text: `## Destination Highlights
- **Weather in July**: Hot and sunny (Lisbon ~28°C / Albufeira ~30°C). Bring sunscreen and stay hydrated!
- **Key Attractions**: Lisbon’s historic neighborhoods (Alfama, Baixa), day trip to Sintra if time allows; Albufeira’s beaches and nightlife
- **Local Transportation**: Taxis, rideshares, and trains between Lisbon and Albufeira (about 2.5 hours by train)
- **Cultural Notes**: Portuguese is the main language, but English is widely spoken in tourist areas. Tipping is appreciated but not mandatory; 5–10% is common.

## Budget Breakdown
- **Flights** (Business): ~$3,200–$4,500 per person
- **Accommodation**: 
  - Lisbon (1 night, 4-star): ~$180–$210
  - Albufeira (3 nights, 5-star): ~$580–$700
- **Estimated Daily Expenses** (meals, local transport, misc.): ~$70–$100/day
- **Total Estimated Cost**: ~$3,200–$5,400 overall (depending on flight choice, hotel selection, and personal spending)

## Next Steps
1. Decide on preferred airline/flight option and lock in business fares soon to avoid price increases.
2. Select your top hotels for Lisbon (1 night) and Albufeira (3 nights); confirm availability.
3. Check transport from Lisbon to Albufeira (train or rental car if you prefer). Book in advance during peak summer.
4. Finalize booking and prepare necessary travel documents (passport validity, any applicable entry requirements).
5. Keep an eye on foreign exchange rates and consider purchasing travel insurance.

Feel free to let us know which options you prefer, and we can proceed with a more detailed booking plan!`,
      },
    ],
  },
];

export const messagesMockSecond: UIMessage[] = [
  {
    id: "xJAOotTO1xODcB8h",
    role: "user",
    content: "Help me to plan my summer trip to Greece",
    createdAt: new Date("2025-06-25T16:36:25+03:00"),
    experimental_attachments: undefined,
    parts: [
      {
        type: "text",
        text: "Help me to plan my summer trip to Greece",
      },
    ],
  },
  {
    id: "3f791f1c-777d-42b5-be46-fd3a4046e7bb",
    role: "assistant",
    content:
      "Thanks for reaching out! Before I can look up flights and accommodations, can you please share:\n• Your exact departure city/airport\n• Specific city/area in Greece you’d like to visit\n• Your travel dates (or approximate timeframe in the summer)\n• How many people are traveling (adults/children)\n• Your budget range (economy, mid-range, luxury)\n\nOnce I have these details, I’ll be happy to research available flights, lodging options, and put together a detailed trip plan!",
    createdAt: new Date("2025-06-25T16:36:39+03:00"),
    experimental_attachments: undefined,
    parts: [
      { type: "step-start" },
      {
        type: "text",
        text: "Thanks for reaching out! Before I can look up flights and accommodations, can you please share:\n• Your exact departure city/airport\n• Specific city/area in Greece you’d like to visit\n• Your travel dates (or approximate timeframe in the summer)\n• How many people are traveling (adults/children)\n• Your budget range (economy, mid-range, luxury)\n\nOnce I have these details, I’ll be happy to research available flights, lodging options, and put together a detailed trip plan!",
      },
    ],
  },
  {
    id: "dqisVder4HoOR8TV",
    role: "user",
    content:
      "from city London, from 5 July to 8 July, only me only adult, around 2000$",
    createdAt: new Date("2025-06-25T16:36:44+03:00"),
    experimental_attachments: undefined,
    parts: [
      {
        type: "text",
        text: "from city London, from 5 July to 8 July, only me only adult, around 2000$",
      },
    ],
  },
  {
    id: "67f01f29-2dac-4f14-9a54-0cc68336981e",
    role: "assistant",
    content:
      "It looks like we still need your destination to start looking for flights or accommodations. Could you let me know exactly where you’d like to go from London on July 5–8? Once I have that, I can start searching for flight and hotel options within your $2,000 budget.",
    createdAt: new Date("2025-06-25T16:36:59+03:00"),
    experimental_attachments: undefined,
    parts: [
      { type: "step-start" },
      {
        type: "text",
        text: "It looks like we still need your destination to start looking for flights or accommodations. Could you let me know exactly where you’d like to go from London on July 5–8? Once I have that, I can start searching for flight and hotel options within your $2,000 budget.",
      },
    ],
  },
];
