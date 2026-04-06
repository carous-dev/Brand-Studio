"use client"
import React, { useState } from 'react'
import { Phone, Calendar } from 'lucide-react'
import EnquiryForm from '../EnquiryForm'
import '../../styles/snackbar.css'
import { useBrand } from '../../context/BrandClientWrapper'

export default function Summary(props: any) {
    const { vehicle, fmtPrice, fmtMileage, chipIcons, showChipTooltip, hideChipTooltip, chipDetail } = props
    const brand = useBrand()
    const email = brand?.location?.email || 'info@example.com'
    const [enquiryOpen, setEnquiryOpen] = useState(false)
    const [snackbar, setSnackbar] = useState<{ msg: string; success: boolean; visible: boolean }>({ msg: '', success: true, visible: false })

    const showSnackbar = (msg: string, success = true) => {
        setSnackbar({ msg, success, visible: true })
        window.setTimeout(() => setSnackbar(s => ({ ...s, visible: false })), 4200)
    }

    return (
        <>
            <div className="vehicle-summary">
                <div className="vehicle-card">
                    <div className="card-head">
                        <div className="titles">
                            <>
                                <h1 className="vehicle-title" id="vehicleTitle">{vehicle?.year ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : `${vehicle?.make || ''} ${vehicle?.model || ''}`}</h1>
                                <div id="vehicleDerivative" className="vehicle-derivative">{vehicle?.derivative || vehicle?.trim || ''}</div>
                                <div id="vehicleSubTitle" className="vehicle-subtitle" aria-live="polite">{vehicle?.subTitle || vehicle?.subtitle || ''}</div>
                            </>
                        </div>
                        <div className="price" id="vehiclePrice">{vehicle?.price ? fmtPrice(vehicle.price) : '—'}</div>
                    </div>

                <div className="specs-chips" id="specsChips" role="list" aria-label="Vehicle specs">
                    <>
                        <span className="chip year" role="listitem" tabIndex={0}
                            onMouseEnter={(e) => showChipTooltip(e.currentTarget, chipDetail('Year'))}
                            onMouseLeave={() => hideChipTooltip()}
                            onFocus={(e) => showChipTooltip(e.currentTarget, chipDetail('Year'))}
                            onBlur={() => hideChipTooltip()}>
                            <span className="chip-icon" aria-hidden="true">{chipIcons.Year}</span>
                            <div className="chip-body"><strong>Year</strong><span className="chip-value">{vehicle?.year ?? '—'}</span></div>
                        </span>

                        <span className="chip owners" role="listitem" tabIndex={0}
                            onMouseEnter={(e) => showChipTooltip(e.currentTarget, chipDetail('Owners'))}
                            onMouseLeave={() => hideChipTooltip()}
                            onFocus={(e) => showChipTooltip(e.currentTarget, chipDetail('Owners'))}
                            onBlur={() => hideChipTooltip()}>
                            <span className="chip-icon" aria-hidden="true">{chipIcons.Owners}</span>
                            <div className="chip-body"><strong>Owners</strong><span className="chip-value">{vehicle?.owners ?? '—'}</span></div>
                        </span>

                        <span className="chip body" role="listitem" tabIndex={0}
                            onMouseEnter={(e) => showChipTooltip(e.currentTarget, chipDetail('Body'))}
                            onMouseLeave={() => hideChipTooltip()}
                            onFocus={(e) => showChipTooltip(e.currentTarget, chipDetail('Body'))}
                            onBlur={() => hideChipTooltip()}>
                            <span className="chip-icon" aria-hidden="true">{chipIcons.Body}</span>
                            <div className="chip-body"><strong>Body</strong><span className="chip-value">{vehicle?.bodyType ?? '—'}</span></div>
                        </span>

                        <span className="chip engine" role="listitem" tabIndex={0}
                            onMouseEnter={(e) => showChipTooltip(e.currentTarget, chipDetail('Engine'))}
                            onMouseLeave={() => hideChipTooltip()}
                            onFocus={(e) => showChipTooltip(e.currentTarget, chipDetail('Engine'))}
                            onBlur={() => hideChipTooltip()}>
                            <span className="chip-icon" aria-hidden="true">{chipIcons.Engine}</span>
                            <div className="chip-body"><strong>Engine</strong><span className="chip-value">{vehicle?.engineCapacity ?? vehicle?.engineCapacityLitres ?? '—'}</span></div>
                        </span>

                        <span className="chip mileage" role="listitem" tabIndex={0}
                            onMouseEnter={(e) => showChipTooltip(e.currentTarget, chipDetail('Mileage'))}
                            onMouseLeave={() => hideChipTooltip()}
                            onFocus={(e) => showChipTooltip(e.currentTarget, chipDetail('Mileage'))}
                            onBlur={() => hideChipTooltip()}>
                            <span className="chip-icon" aria-hidden="true">{chipIcons.Mileage}</span>
                            <div className="chip-body"><strong>Mileage</strong><span className="chip-value">{fmtMileage(vehicle?.mileage)}</span></div>
                        </span>

                        <span className="chip trans" role="listitem" tabIndex={0}
                            onMouseEnter={(e) => showChipTooltip(e.currentTarget, chipDetail('Transmission'))}
                            onMouseLeave={() => hideChipTooltip()}
                            onFocus={(e) => showChipTooltip(e.currentTarget, chipDetail('Transmission'))}
                            onBlur={() => hideChipTooltip()}>
                            <span className="chip-icon" aria-hidden="true">{chipIcons.Transmission}</span>
                            <div className="chip-body"><strong>Transmission</strong><span className="chip-value">{vehicle?.trans ?? '—'}</span></div>
                        </span>

                        <span className="chip fuel" role="listitem" tabIndex={0}
                            onMouseEnter={(e) => showChipTooltip(e.currentTarget, chipDetail('Fuel'))}
                            onMouseLeave={() => hideChipTooltip()}
                            onFocus={(e) => showChipTooltip(e.currentTarget, chipDetail('Fuel'))}
                            onBlur={() => hideChipTooltip()}>
                            <span className="chip-icon" aria-hidden="true">{chipIcons.Fuel}</span>
                            <div className="chip-body"><strong>Fuel</strong><span className="chip-value">{vehicle?.fuel ?? '—'}</span></div>
                        </span>

                        <span className="chip doors" role="listitem" tabIndex={0}
                            onMouseEnter={(e) => showChipTooltip(e.currentTarget, chipDetail('Doors'))}
                            onMouseLeave={() => hideChipTooltip()}
                            onFocus={(e) => showChipTooltip(e.currentTarget, chipDetail('Doors'))}
                            onBlur={() => hideChipTooltip()}>
                            <span className="chip-icon" aria-hidden="true">{chipIcons.Doors}</span>
                            <div className="chip-body"><strong>Doors</strong><span className="chip-value">{vehicle?.doors ?? '—'}</span></div>
                        </span>

                        <span className="chip colour" role="listitem" tabIndex={0}
                            onMouseEnter={(e) => showChipTooltip(e.currentTarget, chipDetail('Colour'))}
                            onMouseLeave={() => hideChipTooltip()}
                            onFocus={(e) => showChipTooltip(e.currentTarget, chipDetail('Colour'))}
                            onBlur={() => hideChipTooltip()}>
                            <span className="chip-icon" aria-hidden="true">{chipIcons.Colour}</span>
                            <div className="chip-body"><strong>Colour</strong><span className="chip-value">{vehicle?.color ?? vehicle?.colour ?? '—'}</span></div>
                        </span>
                    </>
                </div>
                <div className="card-actions">
                    <button type="button" className="btn primary" id="requestInfo" onClick={() => setEnquiryOpen(true)}>
                        <Phone size={16} aria-hidden="true" />
                        Contact
                    </button>
                    <a className="btn ghost" id="bookTest" href={`mailto:${email}?subject=Book%20visit%20for%20${encodeURIComponent(vehicle?.make || '')}%20${encodeURIComponent(vehicle?.model || '')}`}>
                        <Calendar size={16} aria-hidden="true" />
                        Book Visit
                    </a>
                </div>
            </div>
            <EnquiryForm open={enquiryOpen} onClose={() => setEnquiryOpen(false)} initialReg={(vehicle?.year ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : `${vehicle?.make || ''} ${vehicle?.model || ''}`) || ''} vehicle={vehicle} showSnackbar={showSnackbar} />
        </div>

        {/* Snackbar */}
        {snackbar.visible && (
            <div id="snackbar" className={`snackbar ${snackbar.success ? 'snackbar--success' : 'snackbar--error'} snackbar--visible`} role="status" aria-live="polite">{snackbar.msg}</div>
        )}
        </>
    )
}
