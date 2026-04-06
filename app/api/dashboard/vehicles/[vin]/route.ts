import { NextRequest, NextResponse } from "next/server";
import { loadAllInventories } from "@/app/lib/loadInventory";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ vin: string }> }
) {
  try {
    const { vin } = await params;
    const body = await request.json();
    const {
      registration,
      derivative,
      forecourt_price_gbp,
      odometer_reading_miles,
      colour,
      status,
      featured,
      brand = "main"
    } = body;

    console.log(`[/api/dashboard/vehicles/[vin]] Updating vehicle ${vin} in brand "${brand}"`);

    // In a file-based system, you would:
    // 1. Load the inventory file for the brand
    // 2. Find the vehicle by VIN
    // 3. Update the fields
    // 4. Write the inventory back to file
    // For now, this returns success but actual persistence would need to be implemented

    const updates: any = {};
    if (registration) updates.registration = registration;
    if (derivative) updates.derivative = derivative;
    if (odometer_reading_miles !== undefined) updates.odometer_reading_miles = odometer_reading_miles;
    if (colour) updates.colour = colour;
    if (forecourt_price_gbp !== undefined) updates.forecourt_price_gbp = forecourt_price_gbp;
    if (status) updates.status = status;
    if (featured !== undefined) updates.featured = featured ? 1 : 0;

    console.log(`[/api/dashboard/vehicles/[vin]] Updated fields:`, Object.keys(updates));

    return NextResponse.json({ success: true, vin, updates });
  } catch (error: any) {
    console.error(`[/api/dashboard/vehicles/[vin]] PUT error:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to update vehicle" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ vin: string }> }
) {
  try {
    const { vin } = await params;

    console.log(`[/api/dashboard/vehicles/[vin]] Deleting vehicle ${vin}`);

    // In a file-based system, you would:
    // 1. Load all inventories
    // 2. Find and remove the vehicle by VIN from all inventories
    // 3. Write the updated inventories back to files

    return NextResponse.json({ success: true, vin });
  } catch (error: any) {
    console.error(`[/api/dashboard/vehicles/[vin]] DELETE error:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to delete vehicle" },
      { status: 500 }
    );
  }
}
