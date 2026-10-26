"use client";

import { useState } from "react";
import { Coffee, Heart, Download, ExternalLink, X } from "lucide-react";
import { Button, Modal } from "./ui";

const TRAKTEER_URL = "https://trakteer.id/perpus_opera";
const DONATION_AMOUNT = [6000, 12000, 18000, 24000, 30000, 50000];

export function DonationWidget() {
  const [open, setOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(6000);

  const trakteerLink = `${TRAKTEER_URL}?amount=${selectedAmount}`;

  return (
    <>
      {/* Floating Widget Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-leaf-600 px-4 py-3 text-white shadow-lg shadow-leaf-600/30 transition hover:bg-leaf-700 hover:scale-105"
        aria-label="Dukung proyek"
      >
        <Coffee className="h-5 w-5" />
        <span className="text-sm font-semibold hidden sm:inline">
          Dukung Proyek
        </span>
      </button>

      {/* Modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Web App Ini Gratis & Bebas Iklan"
        description="Kopi kecil, server tetap jalan. Terima kasih!"
      >
        <div className="space-y-5">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-leaf-100 text-leaf-600">
              <Coffee className="h-8 w-8" />
            </div>
          </div>

          {/* Amount Selection */}
          <div>
            <p className="mb-2 text-sm font-medium text-leaf-800">
              Pilih nominal traktiran:
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DONATION_AMOUNT.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition ${
                    selectedAmount === amount
                      ? "border-leaf-600 bg-leaf-50 text-leaf-700"
                      : "border-leaf-200 bg-white text-leaf-600 hover:border-leaf-300"
                  }`}
                >
                  Rp{amount.toLocaleString("id-ID")}
                </button>
              ))}
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs text-leaf-600">
              Scan QR Code atau kunjungi link berikut:
            </p>
            <div className="rounded-2xl border-2 border-leaf-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-center h-48 w-48 rounded-lg bg-leaf-50 relative overflow-hidden">
                <svg
                  width="160"
                  height="160"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-leaf-200"
                >
                  <rect width="200" height="200" fill="url(#qrbg)" />
                  <path d="M20 20H180V140H20V20ZM40 40H160V120H40V40Z" fill="#000" />
                  <path d="M60 60H140V100H60V60ZM80 80H120V120H80V80Z" fill="#000" />
                  <path d="M50 50H150V150H50V50ZM70 70H130V130H70V70Z" fill="#000" />
                  <defs>
                    <rect id="qrbg" x="0" y="0" width="200" height="200" fill="#fff" />
                  </defs>
                </svg>
              </div>
            </div>
            <a
              href={trakteerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-semibold text-leaf-600 hover:underline"
            >
              {trakteerLink}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href={trakteerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="primary" className="w-full">
                <Coffee className="h-4 w-4" />
                Traktir Sekarang
              </Button>
            </a>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
              Tutup
            </Button>
          </div>

          <p className="text-center text-xs text-leaf-500">
            Dibuat dengan ❤️ oleh MZF - 2026
          </p>
        </div>
      </Modal>
    </>
  );
}