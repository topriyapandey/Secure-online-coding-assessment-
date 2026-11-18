namespace CodingAssessment.Api.Helpers
{
    public static class LanguageMapping
    {
        // Standard Judge0 Language IDs
        public const int PythonId = 71;   // Python (3.8.1)
        public const int CppId = 54;      // C++ (GCC 9.2.0)
        public const int JavaId = 62;     // Java (OpenJDK 13.0.1)
        public const int CSharpId = 51;   // C# (Mono 6.6.0.161)

        public static int GetJudge0LanguageId(string language)
        {
            return language.ToLower().Trim() switch
            {
                "python" or "py" or "python3" => PythonId,
                "cpp" or "c++" => CppId,
                "java" => JavaId,
                "csharp" or "c#" or "cs" => CSharpId,
                _ => PythonId
            };
        }

        public static string GetDefaultBoilerplate(string language)
        {
            return language.ToLower().Trim() switch
            {
                "python" =>
@"import sys

def solve():
    lines = sys.stdin.read().splitlines()
    if not lines:
        return
    # Read input and implement solution
    pass

if __name__ == '__main__':
    solve()
",
                "cpp" =>
@"#include <iostream>
#include <vector>
#include <string>
#include <sstream>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    // Read input and implement solution
    return 0;
}
",
                "java" =>
@"import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws Exception {
        Scanner scanner = new Scanner(System.in);
        // Read input and implement solution
    }
}
",
                "csharp" =>
@"using System;
using System.Collections.Generic;

public class Program
{
    public static void Main()
    {
        // Read input and implement solution
    }
}
",
                _ => "// Write your solution here\n"
            };
        }
    }
}
