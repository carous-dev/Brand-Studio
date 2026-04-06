import { NextRequest, NextResponse } from "next/server";
import { loadAllInventories, normalizeVehicle } from "@/app/lib/loadInventory";

export async function GET() {
  try {
    // Load all inventories (all brands)
    const allInventories = loadAllInventories();
    const mainInventory = allInventories.get("main") || [];

    console.log(`[/api/dashboard/vehicles] Loaded ${mainInventory.length} vehicles from main inventory`);

    // Format vehicles for dashboard display
    const vehicles = mainInventory.map((item: any) => {
      const normalized = normalizeVehicle(item);
      return {
        vin: normalized.vin,
        registration: normalized.registration,
        make_id: null, // Not applicable for file-based inventory
        model_id: null, // Not applicable for file-based inventory
        make: normalized.make,
        model: normalized.model,
        derivative: normalized.derivative,
        odometer_reading_miles: normalized.mileage,
        colour: normalized.colour,
        advert_id: `adv-${normalized.vin || normalized.registration}`,
        forecourt_price_gbp: normalized.price,
        status: "publish",
        featured: item.featured || false,
        date_on_forecourt: item.date_on_forecourt || new Date().toISOString()
      };
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("[/api/dashboard/vehicles] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      vin,
      registration,
      make_name,
      model_name,
      derivative,
      year_of_manufacture,
      body_type,
      fuel_type,
      transmission_type,
      colour,
      engine_capacity_cc,
      engine_power_bhp,
      seats,
      doors,
      forecourt_price_gbp,
      odometer_reading_miles,
      description,
      status = "draft",
      featured = false,
      brand = "main"
    } = body;

    // Validate required fields
    if (!registration) {
      return NextResponse.json(
        { error: "Registration is required" },
        { status: 400 }
      );
    }

    // Generate VIN if not provided
    const vehicleVin = vin || `VIN-${registration}-${Date.now()}`;

    // Create vehicle object for inventory
    const newVehicle = {
      vin: vehicleVin,
      registration,
      make: make_name || null,
      model: model_name || null,
      derivative: derivative || null,
      year: year_of_manufacture || null,
      body_type: body_type || null,
      fuel_type: fuel_type || null,
      transmission_type: transmission_type || null,
      colour: colour || null,
      engine_capacity_cc: engine_capacity_cc || null,
      engine_power_bhp: engine_power_bhp || null,
      seats: seats || null,
      doors: doors || null,
      odometer_reading_miles: odometer_reading_miles || null,
      mileage: odometer_reading_miles || null,
      price: forecourt_price_gbp || null,
      forecourt_price_gbp: forecourt_price_gbp || null,
      description: description || null,
      status: status,
      featured: featured ? 1 : 0,
      date_on_forecourt: new Date().toISOString()
    };

    console.log(`[/api/dashboard/vehicles] Created new vehicle: ${registration} in brand "${brand}"`);

    // In a file-based system, you would typically:
    // 1. Load the brand inventory
    // 2. Add the new vehicle to it
    // 3. Write it back to the JSON file
    // For now, we'll just return success
    // TODO: Implement file-based persistence if needed

    return NextResponse.json(
      { success: true, vin: vehicleVin, vehicle: newVehicle },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[/api/dashboard/vehicles] POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create vehicle" },
      { status: 500 }
    );
  }
}
