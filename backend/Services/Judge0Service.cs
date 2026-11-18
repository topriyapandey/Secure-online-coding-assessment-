using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;
using CodingAssessment.Api.Helpers;

namespace CodingAssessment.Api.Services
{
    public class Judge0SubmissionRequest
    {
        [JsonPropertyName("source_code")]
        public string SourceCode { get; set; } = string.Empty;

        [JsonPropertyName("language_id")]
        public int LanguageId { get; set; }

        [JsonPropertyName("stdin")]
        public string? Stdin { get; set; }

        [JsonPropertyName("expected_output")]
        public string? ExpectedOutput { get; set; }

        [JsonPropertyName("cpu_time_limit")]
        public double CpuTimeLimit { get; set; } = 3.0;

        [JsonPropertyName("memory_limit")]
        public int MemoryLimit { get; set; } = 128000;
    }

    public class Judge0StatusResponse
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;
    }

    public class Judge0SubmissionResponse
    {
        [JsonPropertyName("stdout")]
        public string? Stdout { get; set; }

        [JsonPropertyName("stderr")]
        public string? Stderr { get; set; }

        [JsonPropertyName("compile_output")]
        public string? CompileOutput { get; set; }

        [JsonPropertyName("message")]
        public string? Message { get; set; }

        [JsonPropertyName("status")]
        public Judge0StatusResponse? Status { get; set; }

        [JsonPropertyName("time")]
        public string? Time { get; set; }

        [JsonPropertyName("memory")]
        public double? Memory { get; set; }
    }

    public class CodeExecutionResult
    {
        public bool Success { get; set; }
        public string Status { get; set; } = "Accepted"; // Accepted, Wrong Answer, Compilation Error, Runtime Error, Time Limit Exceeded
        public string? Output { get; set; }
        public string? ErrorMessage { get; set; }
        public string? CompileOutput { get; set; }
        public double? ExecutionTimeMs { get; set; }
        public double? MemoryKb { get; set; }
        public bool Passed { get; set; }
    }

    public interface IJudge0Service
    {
        Task<CodeExecutionResult> ExecuteAsync(
            string sourceCode,
            string language,
            string? stdin,
            string? expectedOutput = null);
    }

    public class Judge0Service : IJudge0Service
    {
        private readonly HttpClient _httpClient;
        private readonly Judge0Settings _settings;
        private readonly ILogger<Judge0Service> _logger;

        public Judge0Service(
            HttpClient httpClient,
            IOptions<Judge0Settings> settings,
            ILogger<Judge0Service> logger)
        {
            _httpClient = httpClient;
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task<CodeExecutionResult> ExecuteAsync(
            string sourceCode,
            string language,
            string? stdin,
            string? expectedOutput = null)
        {
            var languageId = LanguageMapping.GetJudge0LanguageId(language);

            var baseUrl = _settings.BaseUrl.TrimEnd('/');
            var requestUrl = $"{baseUrl}/submissions?base64_encoded=true&wait=true";

            var requestBody = new Judge0SubmissionRequest
            {
                SourceCode = Base64Encode(sourceCode),
                LanguageId = languageId,
                Stdin = stdin != null ? Base64Encode(stdin) : null,
                ExpectedOutput = expectedOutput != null ? Base64Encode(expectedOutput) : null,
                CpuTimeLimit = _settings.CpuTimeLimit,
                MemoryLimit = _settings.MemoryLimitKb
            };

            var jsonContent = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");

            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, requestUrl)
            {
                Content = jsonContent
            };

            // Set RapidAPI headers if configured
            if (_settings.UseRapidApi && !string.IsNullOrWhiteSpace(_settings.ApiKey))
            {
                httpRequest.Headers.Add("X-RapidAPI-Key", _settings.ApiKey);
                httpRequest.Headers.Add("X-RapidAPI-Host", _settings.RapidApiHost);
            }
            else if (!string.IsNullOrWhiteSpace(_settings.ApiKey))
            {
                httpRequest.Headers.Add("X-Auth-Token", _settings.ApiKey);
            }

            try
            {
                var response = await _httpClient.SendAsync(httpRequest);
                var responseJson = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Judge0 API returned non-success HTTP status {StatusCode}: {Response}", response.StatusCode, responseJson);
                    return new CodeExecutionResult
                    {
                        Success = false,
                        Status = "Execution Error",
                        ErrorMessage = $"Judge0 API error (HTTP {(int)response.StatusCode}): {responseJson}. Please verify Judge0 configuration and credentials in appsettings.json or environment variables."
                    };
                }

                var submissionResponse = JsonSerializer.Deserialize<Judge0SubmissionResponse>(responseJson);
                if (submissionResponse == null)
                {
                    return new CodeExecutionResult
                    {
                        Success = false,
                        Status = "Execution Error",
                        ErrorMessage = "Failed to parse Judge0 response."
                    };
                }

                var stdout = Base64Decode(submissionResponse.Stdout);
                var stderr = Base64Decode(submissionResponse.Stderr);
                var compileOutput = Base64Decode(submissionResponse.CompileOutput);
                var statusDesc = submissionResponse.Status?.Description ?? "Unknown";
                var statusId = submissionResponse.Status?.Id ?? 0;

                double? execTimeMs = null;
                if (!string.IsNullOrEmpty(submissionResponse.Time) && double.TryParse(submissionResponse.Time, out var t))
                {
                    execTimeMs = t * 1000.0;
                }

                // Status mapping according to Judge0 specification:
                // 3: Accepted
                // 4: Wrong Answer
                // 5: Time Limit Exceeded
                // 6: Compilation Error
                // 7..12: Runtime Errors
                // 13: Internal Error
                // 14: Exec Format Error
                string normalizedStatus;
                bool passed = false;

                switch (statusId)
                {
                    case 3:
                        normalizedStatus = "Accepted";
                        passed = true;
                        break;
                    case 4:
                        normalizedStatus = "Wrong Answer";
                        passed = false;
                        break;
                    case 5:
                        normalizedStatus = "Time Limit Exceeded";
                        passed = false;
                        break;
                    case 6:
                        normalizedStatus = "Compilation Error";
                        passed = false;
                        break;
                    case 7:
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                    case 12:
                        normalizedStatus = "Runtime Error";
                        passed = false;
                        break;
                    default:
                        // If no expected output was supplied (e.g. Run Code), check if process completed without error
                        if (expectedOutput == null)
                        {
                            if (string.IsNullOrEmpty(stderr) && string.IsNullOrEmpty(compileOutput))
                            {
                                normalizedStatus = "Completed";
                                passed = true;
                            }
                            else
                            {
                                normalizedStatus = !string.IsNullOrEmpty(compileOutput) ? "Compilation Error" : "Runtime Error";
                                passed = false;
                            }
                        }
                        else
                        {
                            normalizedStatus = statusDesc;
                            // Manual fallback comparison
                            passed = CompareOutput(stdout, expectedOutput);
                            if (passed) normalizedStatus = "Accepted";
                            else if (normalizedStatus == "Accepted") normalizedStatus = "Wrong Answer";
                        }
                        break;
                }

                // If expected output is provided, verify matching trimmed text
                if (expectedOutput != null && statusId == 3)
                {
                    passed = CompareOutput(stdout, expectedOutput);
                    if (!passed)
                    {
                        normalizedStatus = "Wrong Answer";
                    }
                }

                return new CodeExecutionResult
                {
                    Success = true,
                    Status = normalizedStatus,
                    Output = stdout,
                    ErrorMessage = stderr ?? submissionResponse.Message,
                    CompileOutput = compileOutput,
                    ExecutionTimeMs = execTimeMs,
                    MemoryKb = submissionResponse.Memory,
                    Passed = passed
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception while communicating with Judge0");
                return new CodeExecutionResult
                {
                    Success = false,
                    Status = "Execution Service Unavailable",
                    ErrorMessage = $"Could not connect to Judge0 execution service at {_settings.BaseUrl}: {ex.Message}. Please ensure Judge0 is running or API credentials are provided."
                };
            }
        }

        private static bool CompareOutput(string? actual, string? expected)
        {
            if (actual == null && expected == null) return true;
            if (actual == null || expected == null) return false;

            var normActual = actual.Replace("\r\n", "\n").Trim();
            var normExpected = expected.Replace("\r\n", "\n").Trim();
            return string.Equals(normActual, normExpected, StringComparison.Ordinal);
        }

        private static string Base64Encode(string plainText)
        {
            if (string.IsNullOrEmpty(plainText)) return string.Empty;
            var plainTextBytes = Encoding.UTF8.GetBytes(plainText);
            return Convert.ToBase64String(plainTextBytes);
        }

        private static string? Base64Decode(string? base64EncodedData)
        {
            if (string.IsNullOrEmpty(base64EncodedData)) return null;
            try
            {
                var base64EncodedBytes = Convert.FromBase64String(base64EncodedData);
                return Encoding.UTF8.GetString(base64EncodedBytes);
            }
            catch
            {
                return base64EncodedData; // Return as-is if not valid base64
            }
        }
    }
}
