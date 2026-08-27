export type CrustdataCompany = {
  crustdata_company_id?: number;
  basic_info?: {
    name?: string;
    primary_domain?: string;
    year_founded?: number;
    industries?: string[];
  };
  taxonomy?: {
    professional_network_industry?: string;
    categories?: string[];
  };
  headcount?: {
    total?: number;
    growth_percent?: {
      "6m"?: number;
    };
  };
  locations?: {
    country?: string;
    headquarters?: string;
  };
  funding?: {
    total_investment_usd?: number;
    last_round_amount_usd?: number;
    last_fundraise_date?: string;
    last_round_type?: string;
  };
};

export type CrustdataCompanySearchResponse = {
  companies?: CrustdataCompany[];
  next_cursor?: string | null;
  total_count?: number;
};

export type CrustdataJob = {
  crustdata_job_id?: number;
  job_details?: {
    title?: string;
    url?: string;
  };
  company?: {
    basic_info?: {
      crustdata_company_id?: number;
      name?: string;
      primary_domain?: string;
    };
  };
  metadata?: {
    date_added?: string;
  };
};

export type CrustdataJobSearchResponse = {
  job_listings?: CrustdataJob[];
  next_cursor?: string | null;
  total_count?: number;
};

export type CrustdataErrorResponse = {
  error?: string;
  description?: string;
  detail?: string;
  message?: string;
  errors?: Array<{
    message?: string;
    description?: string;
  }>;
};
