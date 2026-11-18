namespace CodingAssessment.Api.Helpers
{
    public class JwtSettings
    {
        public string SecretKey { get; set; } = "SecureCodingAssessmentPlatformSecretKey2026!MustBe32BytesLong";
        public string Issuer { get; set; } = "CodingAssessmentApi";
        public string Audience { get; set; } = "CodingAssessmentClient";
        public int ExpirationMinutes { get; set; } = 480; // 8 hours
    }
}
