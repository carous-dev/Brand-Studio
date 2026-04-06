import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/app/lib/db.server";

/**
 * Lookup vehicle details from the database using registration and mileage
 * This is used during vehicle creation to auto-fill vehicle details from Autotrader data
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const registration = url.searchParams.get("registration");
    const mileage = url.searchParams.get("mileage");

    if (!registration) {
      return NextResponse.json(
        { error: "Registration is required" },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Search for vehicle with matching registration
    // Try to find closest match by mileage if provided
    const searchSql = `
      SELECT 
        v.vin, v.registration, v.make_id, v.model_id, v.derivative, 
        v.year_of_manufacture, v.body_type, v.fuel_type, v.transmission_type,
        v.colour, v.engine_capacity_cc, v.engine_power_bhp, v.seats, v.doors,
        v.odometer_reading_miles, v.description,
        mk.name as make_name, mo.name as model_name,
        a.forecourt_price_gbp, a.stock_status
      FROM vehicle v
      LEFT JOIN make mk ON v.make_id = mk.make_id
      LEFT JOIN model mo ON v.model_id = mo.model_id
      LEFT JOIN advert a ON v.vin = a.vin
      WHERE UPPER(TRIM(v.registration)) = UPPER(TRIM(?))
      ORDER BY
        ${mileage ? `ABS(v.odometer_reading_miles - ?) ASC,` : ""}
        v.vin ASC
      LIMIT 1
    `;

    const params = mileage
      ? [registration, parseInt(mileage)]
      : [registration];

    const [rows]: any = await pool.query(searchSql, params);

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        {
          error: "Vehicle not found in database",
          message: "Please ensure the vehicle details are correct",
        },
        { status: 404 }
      );
    }

    const vehicle = rows[0];

    // Return formatted vehicle data
    return NextResponse.json({
      data: {
        vin: vehicle.vin,
        registration: vehicle.registration,
        derivative: vehicle.derivative,
        make_name: vehicle.make_name,
        model_name: vehicle.model_name,
        year_of_manufacture: vehicle.year_of_manufacture,
        body_type: vehicle.body_type,
        fuel_type: vehicle.fuel_type,
        transmission_type: vehicle.transmission_type,
        colour: vehicle.colour,
        engine_capacity_cc: vehicle.engine_capacity_cc,
        engine_power_bhp: vehicle.engine_power_bhp,
        seats: vehicle.seats,
        doors: vehicle.doors,
        odometer_reading_miles: vehicle.odometer_reading_miles,
        description: vehicle.description,
        forecourt_price_gbp: vehicle.forecourt_price_gbp,
      },
    });
  } catch (error) {
    console.error("GET /api/vehicles/lookup error:", error);
    return NextResponse.json(
      { error: "Failed to lookup vehicle" },
      { status: 500 }
    );
  }
}
