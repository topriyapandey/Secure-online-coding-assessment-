namespace CodingAssessment.Api.Helpers
{
    public class Judge0Settings
    {
        /// <summary>
        /// Base URL of Judge0 API (e.g., https://judge0-ce.p.rapidapi.com or self-hosted http://localhost:2358)
        /// </summary>
        public string BaseUrl { get; set; } = "https://judge0-ce.p.rapidapi.com";

        /// <summary>
        /// RapidAPI Key if using RapidAPI-hosted Judge0 CE/PE
        /// </summary>
        public string ApiKey { get; set; } = "";

        /// <summary>
        /// RapidAPI Host header
        /// </summary>
        public string RapidApiHost { get; set; } = "judge0-ce.p.rapidapi.com";

        /// <summary>
        /// Set to true if accessing via RapidAPI, false if self-hosted / direct instance
        /// </summary>
        public bool UseRapidApi { get; set; } = true;

        /// <summary>
        /// Default execution time limit in seconds
        /// </summary>
        public double CpuTimeLimit { get; set; } = 3.0;

        /// <summary>
        /// Default execution memory limit in KB (128 MB = 128000 KB)
        /// </summary>
        public int MemoryLimitKb { get; set; } = 128000;
    }
}
