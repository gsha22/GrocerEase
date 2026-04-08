# HAT: User Story 3 — Discover nearby stores (shopper)

**Related issue:** [#66 — HAT: Discover nearby stores (shopper)](https://github.com/gsha22/GrocerEase/issues/66)  
**Implementing PR:** _Add PR link here when tracked in #66._  
**Tester:** Christine Tran

## User story

As a shopper, I want to see a list/map of nearby local grocery stores so that I can discover neighborhood options I didn't know existed.

## Prerequisites

- At least 5 stores are registered in the system with valid addresses and geocoded locations.
- The tester has location services enabled, or a default location is set.
- Stores span a range of distances (some within 1 mile, some within 5 miles).

## Steps executed

Protocol from issue #66 (record results after the session):

1. Open the application and navigate to the store discovery/directory page.
2. Allow location access when prompted (or enter a zip code if prompted).
3. Observe the list of stores displayed. Note whether each store shows a name, neighborhood, specialty tag, and distance.
4. Confirm that stores appear sorted by proximity (nearest first).
5. If a map view is available, toggle between map and list views.
6. On a mobile device (or with browser resized to ≤480px), repeat steps 2–5 and note usability differences.
7. Time yourself: from landing on the page, how long does it take to find one store you'd want to learn more about? _(Also record when you first open a store profile for **metric 2** if distinct.)_

## Metrics evaluation

Rationale (from test design): (1) **Discovery rate** validates the core “leap of faith”—new options vs a directory of known stores. (2) **Time-to-interest** measures engagement from discovery toward a store profile. (3) **Navigation confidence** approximates first-time usability and activation.

| # | Metric | Result | Observation |
|---|--------|--------|-------------|
| 1 | **Discovery rate** (did the tester find at least one store they didn't previously know about?) | Pass | Q1: many stores were new to her, especially outside her culture—core discovery value landed. |
| 2 | **Time-to-interest** (seconds until the tester clicks into a store profile) | Inconclusive | Difficult to measure time from map loading to store profile since the API had inconsistent loading times |
| 3 | **Navigation confidence** (can the tester use the page without any guidance?) | Partial | Q3: uncertain moment on map—tapping a store opened the profile instead of keeping focus on the map location (mental-model mismatch). |

## Survey

### Q1. Were any of the stores listed ones you hadn't heard of before? If so, what caught your attention?

**Answer:** "I actually haven't heard about a lot of these stores before, especially ones that are from outside my culture"

### Q2. If a friend asked you "where can I find a good local grocery store near [your neighborhood]," would you send them to this page? Why or why not?

**Answer:** "Sure why not, it seems pretty convenient, I wouldn't really be able to give recs on my own anyway"

### Q3. Was there a moment where you felt unsure about what to do next on the page?

**Answer:** "Yeah it felt a little weird clicking on a store from the map page and it takes you to the store profile, I guess I thought it would show me the location on the map instead." (user flow feedback)


