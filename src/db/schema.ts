import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  date,
  numeric,
} from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const farms = pgTable("farms", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  location: text("location"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const plots = pgTable("plots", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id")
    .notNull()
    .references(() => farms.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  area: numeric("area", { precision: 10, scale: 2 }),
  soilType: text("soil_type"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const plantFamilies = pgTable("plant_families", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const crops = pgTable("crops", {
  id: serial("id").primaryKey(),
  commonName: text("common_name").notNull(),
  familyId: integer("family_id")
    .notNull()
    .references(() => plantFamilies.id, { onDelete: "cascade" }),
  nutrientDemand: text("nutrient_demand").notNull(), // tinggi | sedang | rendah
  daysToHarvest: integer("days_to_harvest"),
  notes: text("notes"),
});

export const plantings = pgTable("plantings", {
  id: serial("id").primaryKey(),
  plotId: integer("plot_id")
    .notNull()
    .references(() => plots.id, { onDelete: "cascade" }),
  cropId: integer("crop_id")
    .notNull()
    .references(() => crops.id, { onDelete: "cascade" }),
  plantedOn: date("planted_on").notNull(),
  harvestedOn: date("harvested_on"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const soilTests = pgTable("soil_tests", {
  id: serial("id").primaryKey(),
  plotId: integer("plot_id")
    .notNull()
    .references(() => plots.id, { onDelete: "cascade" }),
  testedOn: date("tested_on").notNull(),
  ph: numeric("ph", { precision: 4, scale: 2 }),
  n: numeric("n", { precision: 6, scale: 2 }),
  p: numeric("p", { precision: 6, scale: 2 }),
  k: numeric("k", { precision: 6, scale: 2 }),
  organicMatter: numeric("organic_matter", { precision: 6, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Profile = typeof profiles.$inferSelect;
export type Farm = typeof farms.$inferSelect;
export type Plot = typeof plots.$inferSelect;
export type PlantFamily = typeof plantFamilies.$inferSelect;
export type Crop = typeof crops.$inferSelect;
export type Planting = typeof plantings.$inferSelect;
export type SoilTest = typeof soilTests.$inferSelect;
