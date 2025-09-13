"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestProfilesPage() {
  const [result, setResult] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const checkProfiles = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/check-profiles")
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const addTestUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/add-test-users", {
        method: "POST",
      })
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profiles 테이블 테스트</h1>

        <div className="flex gap-4 mb-8">
          <Button onClick={checkProfiles} disabled={loading}>
            {loading ? "확인 중..." : "Profiles 테이블 확인"}
          </Button>
          <Button onClick={addTestUsers} disabled={loading} variant="secondary">
            {loading ? "추가 중..." : "테스트 사용자 추가"}
          </Button>
        </div>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>결과</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">{result}</pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
