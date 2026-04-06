"use client"

import React from 'react'

export default function InventorySkeleton({ count = 12 }: { count?: number }) {
  const items = Array.from({ length: count })
  return (
    <>
      {items.map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-media" />
          <div className="skeleton-body">
            <div className="skeleton-line title" />
            <div className="skeleton-line subtitle" />
            <div className="skeleton-row">
              <div className="skeleton-badge" />
              <div className="skeleton-badge" />
              <div className="skeleton-badge small" />
            </div>
            <div className="skeleton-line short" />
          </div>
        </div>
      ))}
    </>
  )
}
