import { Search, Filter } from 'lucide-react';

const FilterBar = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search...',
  searchTitle,
  filters = []
}) => {
  return (
    <div className="page-controls">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '240px', flex: 1 }}>
        {searchTitle && <span className="modal-info-label">{searchTitle}</span>}
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      </div>

      {filters.map((filter) => (
        <div
          key={filter.id}
          style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '180px' }}
        >
          <span className="modal-info-label">{filter.title || filter.label}</span>
          <div className="filter-group">
            <Filter size={18} />
            <select
              value={filter.value}
              onChange={(event) => filter.onChange(event.target.value)}
              aria-label={filter.label}
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FilterBar;
