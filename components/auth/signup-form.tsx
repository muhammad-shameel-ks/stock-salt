'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export function SignupForm() {
    const [fullName, setFullName] = useState('')
    const [orgName, setOrgName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // 1. Sign Up
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    }
                }
            })

            if (authError) throw authError
            if (!authData.user) throw new Error("No user created")

            // 2. Create Organization
            const { data: orgData, error: orgError } = await supabase
                .from('organizations')
                .insert({ name: orgName })
                .select()
                .single()

            if (orgError) throw orgError

            // 3. Create Main Branch (Outlet)
            const { error: outletError } = await supabase
                .from('outlets')
                .insert({
                    name: 'Main Branch',
                    location: 'Headquarters',
                    org_id: orgData.id
                })

            if (outletError) throw outletError

            // 4. Create/Update Profile
            // We use upsert to handle cases where a trigger might have already created the row
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: authData.user.id,
                    full_name: fullName,
                    org_id: orgData.id,
                    role: 'admin',
                    outlet_id: null // Admin isn't tied to one outlet initially
                })

            if (profileError) throw profileError

            router.push('/dashboard/admin')
            router.refresh()

        } catch (err: any) {
            console.error(err)
            setError(err.message || "An error occurred during signup")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-2xl text-center">Create Account</CardTitle>
                <CardDescription className="text-center">
                    Start your new restaurant organization
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="bg-background/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="orgName">Restaurant Name</Label>
                        <Input
                            id="orgName"
                            placeholder="Ocean Catch Seafood"
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            required
                            className="bg-background/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-background/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-background/50"
                        />
                    </div>
                    {error && (
                        <div className="text-sm text-destructive font-medium text-center">
                            {error}
                        </div>
                    )}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Organization...
                            </>
                        ) : (
                            'Get Started'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
