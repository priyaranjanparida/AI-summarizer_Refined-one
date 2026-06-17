/**
 * ============================================================
 * TabGroup.jsx — Reusable Tab Navigation Component
 * ============================================================
 *
 * A horizontal row of tab buttons that lets the user switch
 * between different views or categories. Think of it like the
 * tabs at the top of a browser — only one can be active at a
 * time, and clicking one fires a callback to update the parent.
 *
 * This component is "controlled", meaning it does NOT manage
 * its own state. The parent tells it which tab is active via
 * the `activeTab` prop, and it calls `onTabChange` when the
 * user clicks a different tab. The parent then updates its own
 * state, which flows back down as the new `activeTab`.
 *
 * CSS CLASSES (BEM convention):
 *   .tab-group              — Wrapper / flex container for the tab row
 *   .tab-group__tab         — Individual tab button (base styles)
 *   .tab-group__tab--active — Modifier for the currently selected tab
 *
 * USAGE:
 *   const tabs = [
 *     { id: 'summary', label: '📝 Summary' },
 *     { id: 'bullets', label: '📌 Bullet Points' },
 *   ];
 *
 *   <TabGroup
 *     tabs={tabs}
 *     activeTab={currentTab}
 *     onTabChange={(tabId) => setCurrentTab(tabId)}
 *   />
 * ============================================================
 */

import React from 'react';

/**
 * TabGroup — a row of selectable tabs.
 *
 * @param {Object}   props
 * @param {Array}    props.tabs         — Array of { id: string, label: string }
 * @param {string}   props.activeTab    — The `id` of the currently active tab
 * @param {Function} props.onTabChange  — Called with the tab's `id` when clicked
 */
const TabGroup = ({ tabs = [], activeTab, onTabChange }) => {
  return (
    <div className="tab-group">
      {/* ------------------------------------------------------------------
        * Render one button per tab definition
        * ------------------------------------------------------------------
        * For each tab object we:
        *   1. Apply the base class `tab-group__tab`
        *   2. Conditionally add the `--active` modifier if this tab matches
        *   3. Call `onTabChange` with the tab's id on click
        * ------------------------------------------------------------------ */}
      {tabs.map((tab) => {
        /* Determine if THIS tab is the active one */
        const isActive = tab.id === activeTab;

        /* Build class string: base + optional active modifier */
        const tabClasses = [
          'tab-group__tab',
          isActive ? 'tab-group__tab--active' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={tab.id}
            className={tabClasses}
            onClick={() => onTabChange(tab.id)}
            /* Accessibility: indicate selection state to screen readers */
            aria-selected={isActive}
            role="tab"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default TabGroup;
