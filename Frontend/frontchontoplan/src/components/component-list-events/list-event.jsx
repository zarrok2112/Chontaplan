import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"
import moment from 'moment'
import services from '../../services/services'
import { useSelector } from 'react-redux'

const eventTypeMap = {
  1: "Académico",
  2: "Artístico",
  3: "Deportivo",
  4: "Otro",
}

export default function EventList() {
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Use a try-catch block to handle potential errors when accessing the store
  let token
  try {
    token = useSelector((state) => state.token.value)
  } catch (e) {
    console.error('Error accessing Redux store:', e)
    setError('Unable to access user data. Please try again later.')
  }

  useEffect(() => {
    if (token) {
      setIsLoading(true)
      services.getEvents(token)
        .then((response) => {
          if (response.status === 200) {
            setEvents(response.data)
          }
        })
        .catch((error) => {
          console.error('Error fetching events:', error)
          setError('Failed to fetch events. Please try again later.')
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else if (!error) {
      setError('User token not available. Please log in and try again.')
    }
  }, [token, error])

  if (isLoading) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="p-4">
          <p className="text-center">Loading events...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="p-4">
          <p className="text-center text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Mis Eventos</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[70vh]">
          <div className="space-y-4">
            {events.length > 0 ? (
              events.map((event) => (
                <Card key={event.id} className="bg-secondary">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{event.name}</h3>
                      <Badge variant="outline">{eventTypeMap[event.event_type]}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{event.brief_description}</p>
                    <div className="flex items-center text-sm text-muted-foreground mb-1">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>{moment(event.event_start_datetime).format('LL')}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>{`${moment(event.event_start_datetime).format('LT')} - ${moment(event.event_end_datetime).format('LT')}`}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center">No events found.</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}