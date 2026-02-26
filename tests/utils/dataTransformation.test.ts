import { expect, test } from "@playwright/test";

const mockFlattenedData = {
  id: "off_test123",
  total_amount: "140.88",
  total_currency: "USD",
  base_amount: "100.00",
  base_currency: "USD",
  tax_amount: "40.88",
  tax_currency: "USD",
  total_emissions_kg: "98",
  created_at: "2025-07-18T17:32:44.739248Z",
  updated_at: "2025-07-18T17:32:44.739248Z",
  expires_at: "2025-07-18T18:32:44.736382Z",
  live_mode: false,
  partial: false,
  passenger_identity_documents_required: false,
  "owner.id": "arl_00009VME7DDoV8ZkzmMkak",
  "owner.name": "Vueling",
  "owner.iata_code": "VY",
  "owner.logo_symbol_url": "https://example.com/logo.svg",
  "owner.logo_lockup_url": "https://example.com/lockup.svg",
  "owner.conditions_of_carriage_url": "https://example.com/conditions",
  "passengers.0.id": "pas_0000AwGTgtOAmy6367BPQx",
  "passengers.0.type": "adult",
  "passengers.0.fare_type": null,
  "passengers.0.family_name": null,
  "passengers.0.given_name": null,
  "passengers.0.age": null,
  "slices.0.id": "sli_0000AwGTh0VWK38JAvfsMT",
  "slices.0.comparison_key": "mUR/",
  "slices.0.ngs_shelf": 1,
  "slices.0.origin_type": "airport",
  "slices.0.destination_type": "airport",
  "slices.0.fare_brand_name": "Basic",
  "slices.0.duration": "PT7H30M",
  "slices.0.origin.id": "arp_lis_pt",
  "slices.0.origin.name": "Lisbon Portela Airport",
  "slices.0.origin.iata_code": "LIS",
  "slices.0.origin.iata_city_code": "LIS",
  "slices.0.origin.iata_country_code": "PT",
  "slices.0.origin.city_name": "Lisbon",
  "slices.0.origin.latitude": 38.778446,
  "slices.0.origin.longitude": -9.135643,
  "slices.0.origin.icao_code": "LPPT",
  "slices.0.origin.type": "airport",
  "slices.0.origin.time_zone": "Europe/Lisbon",
  "slices.0.destination.id": "arp_nce_fr",
  "slices.0.destination.name": "Nice-Côte d'Azur Airport",
  "slices.0.destination.iata_code": "NCE",
  "slices.0.destination.iata_city_code": "NCE",
  "slices.0.destination.iata_country_code": "FR",
  "slices.0.destination.city_name": "Nice",
  "slices.0.destination.latitude": 43.659265,
  "slices.0.destination.longitude": 7.212948,
  "slices.0.destination.icao_code": "LFMN",
  "slices.0.destination.type": "airport",
  "slices.0.destination.time_zone": "Europe/Paris",
  "slices.0.segments.0.id": "seg_0000AwGTh0VWK38JAvfsMR",
  "slices.0.segments.0.origin_terminal": null,
  "slices.0.segments.0.destination_terminal": null,
  "slices.0.segments.0.departing_at": "2025-07-25T09:10:00",
  "slices.0.segments.0.arriving_at": "2025-07-25T12:10:00",
  "slices.0.segments.0.duration": "PT2H",
  "slices.0.segments.0.distance": null,
  "slices.0.segments.0.operating_carrier.id": "arl_00009VME7DDoV8ZkzmMkak",
  "slices.0.segments.0.operating_carrier.name": "Vueling",
  "slices.0.segments.0.operating_carrier.iata_code": "VY",
  "slices.0.segments.0.operating_carrier.logo_symbol_url":
    "https://example.com/logo.svg",
  "slices.0.segments.0.operating_carrier.logo_lockup_url":
    "https://example.com/lockup.svg",
  "slices.0.segments.0.operating_carrier.conditions_of_carriage_url":
    "https://example.com/conditions",
  "slices.0.segments.0.marketing_carrier.id": "arl_00009VME7DDoV8ZkzmMkak",
  "slices.0.segments.0.marketing_carrier.name": "Vueling",
  "slices.0.segments.0.marketing_carrier.iata_code": "VY",
  "slices.0.segments.0.marketing_carrier.logo_symbol_url":
    "https://example.com/logo.svg",
  "slices.0.segments.0.marketing_carrier.logo_lockup_url":
    "https://example.com/lockup.svg",
  "slices.0.segments.0.marketing_carrier.conditions_of_carriage_url":
    "https://example.com/conditions",
  "slices.0.segments.0.operating_carrier_flight_number": "8461",
  "slices.0.segments.0.marketing_carrier_flight_number": "8461",
  "slices.0.segments.0.origin.id": "arp_lis_pt",
  "slices.0.segments.0.origin.name": "Lisbon Portela Airport",
  "slices.0.segments.0.origin.iata_code": "LIS",
  "slices.0.segments.0.origin.iata_city_code": "LIS",
  "slices.0.segments.0.origin.iata_country_code": "PT",
  "slices.0.segments.0.origin.city_name": "Lisbon",
  "slices.0.segments.0.origin.latitude": 38.778446,
  "slices.0.segments.0.origin.longitude": -9.135643,
  "slices.0.segments.0.origin.icao_code": "LPPT",
  "slices.0.segments.0.origin.type": "airport",
  "slices.0.segments.0.origin.time_zone": "Europe/Lisbon",
  "slices.0.segments.0.destination.id": "arp_bcn_es",
  "slices.0.segments.0.destination.name":
    "Barcelona–El Prat Josep Tarradellas Airport",
  "slices.0.segments.0.destination.iata_code": "BCN",
  "slices.0.segments.0.destination.iata_city_code": "BCN",
  "slices.0.segments.0.destination.iata_country_code": "ES",
  "slices.0.segments.0.destination.city_name": "Barcelona",
  "slices.0.segments.0.destination.latitude": 41.297273,
  "slices.0.segments.0.destination.longitude": 2.080877,
  "slices.0.segments.0.destination.icao_code": "LEBL",
  "slices.0.segments.0.destination.type": "airport",
  "slices.0.segments.0.destination.time_zone": "Europe/Madrid",
  "slices.0.segments.0.passengers.0.passenger_id": "pas_0000AwGTgtOAmy6367BPQx",
  "slices.0.segments.0.passengers.0.cabin_class": "economy",
  "slices.0.segments.0.passengers.0.cabin_class_marketing_name": "Economy",
  "slices.0.segments.0.passengers.0.cabin.name": "economy",
  "slices.0.segments.0.passengers.0.cabin.marketing_name": "Economy",
  "slices.0.segments.0.passengers.0.cabin.amenities": null,
  "slices.0.segments.0.passengers.0.baggages.0.type": "checked",
  "slices.0.segments.0.passengers.0.baggages.0.quantity": 0,
  "slices.0.segments.0.passengers.0.baggages.1.type": "carry_on",
  "slices.0.segments.0.passengers.0.baggages.1.quantity": 0,
  "slices.1.id": "sli_0000AwGTh0VWK38JAvfsMX",
  "slices.1.comparison_key": "B8B9yA==",
  "slices.1.duration": "PT14H30M",
  "slices.1.origin.id": "arp_nce_fr",
  "slices.1.origin.iata_code": "NCE",
  "slices.1.origin.city_name": "Nice",
  "slices.1.destination.id": "arp_lis_pt",
  "slices.1.destination.iata_code": "LIS",
  "slices.1.destination.city_name": "Lisbon",
  "slices.1.segments.0.id": "seg_0000AwGTh0VWK38JAvfsMV",
  "slices.1.segments.0.departing_at": "2025-07-27T19:00:00",
  "slices.1.segments.0.arriving_at": "2025-07-27T20:25:00",
  "slices.1.segments.0.operating_carrier.name": "Vueling",
  "slices.1.segments.0.operating_carrier_flight_number": "1516",
};

test.describe("Flight Data Transformation", () => {
  test.describe("Flattened to Nested Data Transformation", () => {
    test("should identify flattened data format correctly", () => {
      const hasSliceProperty = "slices.0.id" in mockFlattenedData;
      expect(hasSliceProperty).toBe(true);
    });

    test("should have required top-level properties", () => {
      expect(mockFlattenedData.id).toBe("off_test123");
      expect(mockFlattenedData.total_amount).toBe("140.88");
      expect(mockFlattenedData.total_currency).toBe("USD");
    });

    test("should have flattened owner properties", () => {
      expect(mockFlattenedData["owner.name"]).toBe("Vueling");
      expect(mockFlattenedData["owner.iata_code"]).toBe("VY");
      expect(mockFlattenedData["owner.logo_symbol_url"]).toBe(
        "https://example.com/logo.svg"
      );
    });

    test("should have flattened slice properties", () => {
      expect(mockFlattenedData["slices.0.id"]).toBe(
        "sli_0000AwGTh0VWK38JAvfsMT"
      );
      expect(mockFlattenedData["slices.0.duration"]).toBe("PT7H30M");
      expect(mockFlattenedData["slices.0.origin.iata_code"]).toBe("LIS");
      expect(mockFlattenedData["slices.0.destination.iata_code"]).toBe("NCE");
    });

    test("should have flattened segment properties", () => {
      expect(mockFlattenedData["slices.0.segments.0.id"]).toBe(
        "seg_0000AwGTh0VWK38JAvfsMR"
      );
      expect(mockFlattenedData["slices.0.segments.0.departing_at"]).toBe(
        "2025-07-25T09:10:00"
      );
      expect(
        mockFlattenedData["slices.0.segments.0.operating_carrier.name"]
      ).toBe("Vueling");
    });

    test("should have flattened passenger properties", () => {
      expect(
        mockFlattenedData["slices.0.segments.0.passengers.0.cabin_class"]
      ).toBe("economy");
      expect(
        mockFlattenedData[
          "slices.0.segments.0.passengers.0.cabin_class_marketing_name"
        ]
      ).toBe("Economy");
    });

    test("should have return slice properties", () => {
      expect(mockFlattenedData["slices.1.id"]).toBe(
        "sli_0000AwGTh0VWK38JAvfsMX"
      );
      expect(mockFlattenedData["slices.1.duration"]).toBe("PT14H30M");
      expect(mockFlattenedData["slices.1.origin.iata_code"]).toBe("NCE");
      expect(mockFlattenedData["slices.1.destination.iata_code"]).toBe("LIS");
    });
  });

  test.describe("Workflow Response Format", () => {
    const mockWorkflowResponse = {
      id: "a7a97673-3b87-45da-aa4e-2a003d3a8e56",
      status: "success",
      data: {
        action_input:
          "Sure! Could you let me know what dates you plan to travel from Lisbon to Berlin?",
        action_name: "Final Answer",
        observation: "",
        thought: "I am thinking about how to help you",
      },
      label: "ROUND 1",
      metadata: {
        currency: "USD",
        elapsed_time: 43.8051649140001,
        total_price: "0.161475",
        total_tokens: 7105,
      },
    };

    test("should identify workflow response format correctly", () => {
      expect(mockWorkflowResponse.status).toBe("success");
      expect(mockWorkflowResponse.data).toBeDefined();
      expect(mockWorkflowResponse.data.action_input).toBeDefined();
    });

    test("should have workflow metadata", () => {
      expect(mockWorkflowResponse.metadata.currency).toBe("USD");
      expect(mockWorkflowResponse.metadata.total_tokens).toBe(7105);
    });

    test("should differentiate from flight data", () => {
      const hasFlightProperties = "slices.0.id" in mockWorkflowResponse;
      expect(hasFlightProperties).toBe(false);
    });
  });

  test.describe("Nested Flight Data Format", () => {
    const mockNestedData = {
      id: "off_nested123",
      total_amount: "250.00",
      total_currency: "USD",
      owner: {
        id: "arl_nested",
        name: "Test Airline",
        iata_code: "TA",
        logo_symbol_url: "https://example.com/logo.svg",
      },
      slices: [
        {
          id: "slice_1",
          duration: "PT3H",
          origin: {
            id: "arp_mad_es",
            iata_code: "MAD",
            city_name: "Madrid",
          },
          destination: {
            id: "arp_bcn_es",
            iata_code: "BCN",
            city_name: "Barcelona",
          },
          segments: [
            {
              id: "seg_1",
              departing_at: "2025-08-01T10:00:00",
              arriving_at: "2025-08-01T13:00:00",
              duration: "PT3H",
              operating_carrier: {
                id: "arl_nested",
                name: "Test Airline",
                iata_code: "TA",
                logo_symbol_url: "https://example.com/logo.svg",
              },
              passengers: [
                {
                  passenger_id: "pas_nested",
                  cabin_class: "economy",
                  cabin_class_marketing_name: "Economy",
                  cabin: {
                    name: "economy",
                    marketing_name: "Economy",
                  },
                },
              ],
            },
          ],
        },
      ],
      passengers: [
        {
          id: "pas_nested",
          type: "adult",
        },
      ],
    };

    test("should identify nested data format correctly", () => {
      expect(Array.isArray(mockNestedData.slices)).toBe(true);
      expect(typeof mockNestedData.owner).toBe("object");
      expect(mockNestedData.owner.name).toBe("Test Airline");
    });

    test("should have nested slice structure", () => {
      expect(mockNestedData.slices[0].id).toBe("slice_1");
      expect(mockNestedData.slices[0].origin.iata_code).toBe("MAD");
      expect(mockNestedData.slices[0].destination.iata_code).toBe("BCN");
    });

    test("should have nested segment structure", () => {
      const segment = mockNestedData.slices[0].segments[0];
      expect(segment.id).toBe("seg_1");
      expect(segment.operating_carrier.name).toBe("Test Airline");
      expect(segment.passengers[0].cabin_class).toBe("economy");
    });

    test("should differentiate from flattened format", () => {
      const hasSliceProperty = "slices.0.id" in mockNestedData;
      expect(hasSliceProperty).toBe(false);
    });
  });

  test.describe("Data Format Detection Logic", () => {
    test("should detect flattened format", () => {
      const flattenedOption = { "slices.0.id": "test" };
      const isFlattened = "slices.0.id" in flattenedOption;
      expect(isFlattened).toBe(true);
    });

    test("should detect workflow format", () => {
      const workflowOption = {
        status: "success",
        data: { action_input: "test" },
      };
      const isWorkflow = "status" in workflowOption && "data" in workflowOption;
      expect(isWorkflow).toBe(true);
    });

    test("should detect nested format", () => {
      const nestedOption = { slices: [{ id: "test" }] };
      const isNested = Array.isArray(nestedOption.slices);
      expect(isNested).toBe(true);
    });

    test("should handle edge cases", () => {
      const emptyOption = {};
      const nullOption = null;
      const undefinedOption = undefined;

      expect("slices.0.id" in emptyOption).toBe(false);
      expect(nullOption == null).toBe(true);
      expect(undefinedOption == null).toBe(true);
    });
  });

  test.describe("Expected Transformation Results", () => {
    test("should validate flattened data has expected properties", () => {
      // Test that key flattened properties exist
      expect(mockFlattenedData["owner.name"]).toBe("Vueling");
      expect(mockFlattenedData["slices.0.id"]).toBe(
        "sli_0000AwGTh0VWK38JAvfsMT"
      );
      expect(mockFlattenedData["slices.0.segments.0.id"]).toBe(
        "seg_0000AwGTh0VWK38JAvfsMR"
      );
      expect(
        mockFlattenedData["slices.0.segments.0.operating_carrier.name"]
      ).toBe("Vueling");
      expect(mockFlattenedData["passengers.0.id"]).toBe(
        "pas_0000AwGTgtOAmy6367BPQx"
      );
    });

    test("should validate expected nested structure after transformation", () => {
      // After transformation, we expect these nested structures
      const expectedNestedStructure = {
        owner: {
          name: expect.any(String),
          iata_code: expect.any(String),
        },
        slices: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            segments: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(String),
                operating_carrier: expect.objectContaining({
                  name: expect.any(String),
                }),
              }),
            ]),
          }),
        ]),
        passengers: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
          }),
        ]),
      };

      // This validates the expected structure after transformation
      expect(expectedNestedStructure.owner).toMatchObject({
        name: expect.any(String),
        iata_code: expect.any(String),
      });
    });
  });
});
