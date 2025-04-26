import { database } from './firebase/config';
import { ref, onValue } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { Thermostat, WaterDrop, Air, AccessTime } from '@mui/icons-material';

type SensorData = {
  Timestamp: string;
  Temperature: number;
  Humidity: number;
};

function App() {
  const [data, setData] = useState<SensorData[]>([]);
  const [currentTime, setCurrentTime] = useState<string>(moment().format('YYYY-MM-DD HH:mm:ss'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const sensorRef = ref(database, 'Sensor/');
    onValue(sensorRef, (snapshot) => {
      const rawData = snapshot.val();
      if (rawData) {
        const parsedData = Object.keys(rawData).map((key) => ({
          Timestamp: key,
          Temperature: rawData[key].Temperature,
          Humidity: rawData[key].Humidity,
        }));
        setData(parsedData);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment().format('YYYY-MM-DD HH:mm:ss'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const now = moment();
  const last24HoursData = data.filter((d) =>
    moment(d.Timestamp).isAfter(now.clone().subtract(24, 'hours'))
  );

  const latest = last24HoursData.length > 0 ? last24HoursData[last24HoursData.length - 1] : null;

  const getSummary = (key: keyof SensorData) => {
    const values = last24HoursData.map((d) => Number(d[key])).filter((v) => !isNaN(v));
    if (values.length === 0) {
      return { avg: '0', min: '0', max: '0' };
    }
    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
    const min = Math.min(...values).toFixed(2);
    const max = Math.max(...values).toFixed(2);
    return { avg, min, max };
  };

  const getAirQualityStatus = (temp: number, humidity: number) => {
    if (temp >= 18 && temp <= 28 && humidity >= 30 && humidity <= 60)
      return { status: 'Good', color: '#c8e6c9' };
    if (
      (temp >= 16 && temp < 18) ||
      (temp > 28 && temp <= 32) ||
      (humidity >= 25 && humidity < 30) ||
      (humidity > 60 && humidity <= 70)
    )
      return { status: 'Moderate', color: '#fff9c4' };
    return { status: 'Poor', color: '#ffcdd2' };
  };

  const tempSummary = getSummary('Temperature');
  const humiditySummary = getSummary('Humidity');
  const airStatus = latest ? getAirQualityStatus(Number(latest.Temperature), Number(latest.Humidity)) : null;

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading data...
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ mr: 2 }}>
          Air Quality Dashboard
        </Typography>
        <Chip
          icon={<AccessTime />}
          label={currentTime}
          variant="outlined"
          color="primary"
          sx={{ fontWeight: 'bold' }}
        />
      </Box>

      {latest ? (
        <>
          <Typography variant="h6" gutterBottom>
            Last Updated: {moment(latest.Timestamp).format('YYYY-MM-DD HH:mm:ss')}
          </Typography>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: '#ffebee', borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    <Thermostat sx={{ verticalAlign: 'middle', color: '#f44336' }} /> Latest Temperature
                  </Typography>
                  <Typography variant="h4" color="error" sx={{ mt: 1 }}>
                    {latest.Temperature} °C
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: '#e3f2fd', borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    <WaterDrop sx={{ verticalAlign: 'middle', color: '#2196f3' }} /> Latest Humidity
                  </Typography>
                  <Typography variant="h4" color="primary" sx={{ mt: 1 }}>
                    {latest.Humidity} %
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: airStatus?.color || '#f5f5f5', borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    <Air sx={{ verticalAlign: 'middle', color: '#555' }} /> Air Quality Status
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1 }}>
                    {airStatus?.status || 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: '#fff3e0', borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Avg Temperature (Last 24 hours)
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 1 }}>{tempSummary.avg} °C</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Min: {tempSummary.min} | Max: {tempSummary.max}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: '#e8f5e9', borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Avg Humidity (Last 24 hours)
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 1 }}>{humiditySummary.avg} %</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Min: {humiditySummary.min} | Max: {humiditySummary.max}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={last24HoursData}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="Timestamp" tickFormatter={(t) => moment(t).format('HH:mm')} />
              <YAxis />
              <Tooltip labelFormatter={(label) => moment(label).format('YYYY-MM-DD HH:mm:ss')} />
              <Legend />
              <Line type="monotone" dataKey="Temperature" stroke="#f44336" />
              <Line type="monotone" dataKey="Humidity" stroke="#2196f3" />
            </LineChart>
          </ResponsiveContainer>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Raw Logs (Last 24 hours)
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Temperature (°C)</TableCell>
                  <TableCell>Humidity (%)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {last24HoursData.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>{moment(row.Timestamp).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                    <TableCell>{row.Temperature}</TableCell>
                    <TableCell>{row.Humidity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <Typography variant="h6" sx={{ mt: 4 }}>
          No data available for the last 24 hours.
        </Typography>
      )}
    </Container>
  );
}

export default App;
