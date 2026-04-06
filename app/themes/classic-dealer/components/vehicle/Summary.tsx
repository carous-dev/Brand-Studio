"use client"
import React, { useState } from 'react'
import { Phone, Calendar } from 'lucide-react'
import EnquiryForm from '../EnquiryForm'

export default function Summary(props: any) {
    const { vehicle, fmtPrice, fmtMileage, chipIcons, showChipTooltip, hideChipTooltip, chipDetail } = props
    const [enquiryOpen, setEnquiryOpen] = useState(false)

    return (
        <div className="vehicle-summary">
            <div className="modern-vehicle-card">
                <div className="card-header">
                    <div className="vehicle-info">
                        <h1 className="vehicle-title" id="vehicleTitle">{vehicle?.year ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : `${vehicle?.make || ''} ${vehicle?.model || ''}`}</h1>
                        <div id="vehicleDerivative" className="vehicle-variant">{vehicle?.derivative || vehicle?.trim || ''}</div>
                        <div id="vehicleSubTitle" className="vehicle-subtitle" aria-live="polite">{vehicle?.subTitle || vehicle?.subtitle || ''}</div>
                    </div>
                </div>

                <div className="vehicle-price" id="vehiclePrice">
                    <span className="price-label">Price</span>
                    <span className="price-value">{vehicle?.forecourt_price_gbp || vehicle?.price ? '£' + Number(vehicle.forecourt_price_gbp || vehicle.price).toLocaleString('en-GB') : '—'}</span>
                </div>

                <div className="specs-grid" id="specsChips" role="list" aria-label="Vehicle specs">
                    <div className="spec-item" role="listitem" tabIndex={0}
                        onMouseEnter={(e) => showChipTooltip(e.currentTarget, chipDetail('Year'))}
                        onMouseLeave={() => hideChipTooltip()}
                        onFocus={(e) => showChipTooltip(e.currentTarget, chipDetail('Year'))}
                        onBlur={() => hideChipTooltip()}>
                        <div className="spec-icon">{chipIcons.Year}</div>
                        <div className="spec-details">
                            <span className="spec-label">Year</span>
                            <span className="spec-value">{vehicle?.year ?? '—'}</span>
                        </div>
                    </div>

                    <div className="spec-item" role="listitem" tabIndex={0}
                        onMouseEnter={(e) => showChipTooltip(e.currentTarget, chipDetail('Mileage'))}
                        onMouseLeave={() => hideChipTooltip()}
                        onFocus={(e) => showChipTooltip(e.currentTarget, chipDetail('Mileage'))}
                        onBlur={() => hideChipTooltip()}>
                        <div className="spec-icon">{chipIcons.Mileage}</div>
                        <div className="spec-details">
                            <span className="spec-label">Mileage</span>
                            <span className="spec-value">{fmtMileage(vehicle?.mileage)}</span>
                        </div>
                    </div>

                    <div className="spec-item" role="listitem" tabIndex={0}
                        onMouseEnter={(e) => showChipTooltip(e.currentTarget, chipDetail('Engine'))}
                        onMouseLeave={() => hideChipTooltip()}
                        onFocus={(e) => showChipTooltip(e.currentTarget, chipDetail('Engine'))}
                        onBlur={() => hideChipTooltip()}>
                        <div className="spec-icon">{chipIcons.Engine}</div>
                        <div className="spec-details">
                            <span className="spec-label">Engine</span>
                            <span className="spec-value">{vehicle?.engineCapacity ?? vehicle?.engineCapacityLitres ?? '—'}</span>
                        </div>
                    </div>

                    <div className="spec-item" role="listitem" tabIndex={0}
                        onMouseEnter={(e) => showChipTooltip(e.currentTarget, chipDetail('Transmission'))}
                        onMouseLeave={() => hideChipTooltip()}
                        onFocus={(e) => showChipTooltip(e.currentTarget, chipDetail('Transmission'))}
                        onBlur={() => hideChipTooltip()}>
                        <div className="spec-icon">{chipIcons.Transmission}</div>
                        <div className="spec-details">
                            <span className="spec-label">Transmission</span>
                            <span className="spec-value">{vehicle?.trans ?? '—'}</span>
                        </div>
                    </div>

                    <div className="spec-item" role="listitem" tabIndex={0}
                        onMouseEnter={(e) => showChipTooltip(e.currentTarget, chipDetail('Fuel'))}
                        onMouseLeave={() => hideChipTooltip()}
                        onFocus={(e) => showChipTooltip(e.currentTarget, chipDetail('Fuel'))}
                        onBlur={() => hideChipTooltip()}>
                        <div className="spec-icon">{chipIcons.Fuel}</div>
                        <div className="spec-details">
                            <span className="spec-label">Fuel</span>
                            <span className="spec-value">{vehicle?.fuel ?? '—'}</span>
                        </div>
                    </div>

                    <div className="spec-item" role="listitem" tabIndex={0}
                        onMouseEnter={(e) => showChipTooltip(e.currentTarget, chipDetail('Body'))}
                        onMouseLeave={() => hideChipTooltip()}
                        onFocus={(e) => showChipTooltip(e.currentTarget, chipDetail('Body'))}
                        onBlur={() => hideChipTooltip()}>
                        <div className="spec-icon">{chipIcons.Body}</div>
                        <div className="spec-details">
                            <span className="spec-label">Body</span>
                            <span className="spec-value">{vehicle?.bodyType ?? '—'}</span>
                        </div>
                    </div>

                    <div className="spec-item" role="listitem" tabIndex={0}
                        onMouseEnter={(e) => showChipTooltip(e.currentTarget, chipDetail('Owners'))}
                        onMouseLeave={() => hideChipTooltip()}
                        onFocus={(e) => showChipTooltip(e.currentTarget, chipDetail('Owners'))}
                        onBlur={() => hideChipTooltip()}>
                        <div className="spec-icon">{chipIcons.Owners}</div>
                        <div className="spec-details">
                            <span className="spec-label">Owners</span>
                            <span className="spec-value">{vehicle?.owners ?? '—'}</span>
                        </div>
                    </div>

                    <div className="spec-item" role="listitem" tabIndex={0}
                        onMouseEnter={(e) => showChipTooltip(e.currentTarget, chipDetail('Doors'))}
                        onMouseLeave={() => hideChipTooltip()}
                        onFocus={(e) => showChipTooltip(e.currentTarget, chipDetail('Doors'))}
                        onBlur={() => hideChipTooltip()}>
                        <div className="spec-icon">{chipIcons.Doors}</div>
                        <div className="spec-details">
                            <span className="spec-label">Doors</span>
                            <span className="spec-value">{vehicle?.doors ?? '—'}</span>
                        </div>
                    </div>

                    <div className="spec-item" role="listitem" tabIndex={0}
                        onMouseEnter={(e) => showChipTooltip(e.currentTarget, chipDetail('Colour'))}
                        onMouseLeave={() => hideChipTooltip()}
                        onFocus={(e) => showChipTooltip(e.currentTarget, chipDetail('Colour'))}
                        onBlur={() => hideChipTooltip()}>
                        <div className="spec-icon">{chipIcons.Colour}</div>
                        <div className="spec-details">
                            <span className="spec-label">Colour</span>
                            <span className="spec-value">{vehicle?.color ?? vehicle?.colour ?? '—'}</span>
                        </div>
                    </div>
                </div>

                <div className="card-actions">
                    <button type="button" className="action-btn primary" id="requestInfo" onClick={() => setEnquiryOpen(true)}>
                        <Phone size={18} aria-hidden="true" />
                        <span>Contact</span>
                    </button>
                    <a className="action-btn secondary" id="bookTest" href={`mailto:bookings@example.com?subject=Book%20visit%20for%20${encodeURIComponent(vehicle?.make || '')}%20${encodeURIComponent(vehicle?.model || '')}`}>
                        <Calendar size={18} aria-hidden="true" />
                        <span>Book Visit</span>
                    </a>
                </div>
            </div>
            <EnquiryForm open={enquiryOpen} onClose={() => setEnquiryOpen(false)} initialReg={(vehicle?.year ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : `${vehicle?.make || ''} ${vehicle?.model || ''}`) || ''} />
        </div>
    )
}
